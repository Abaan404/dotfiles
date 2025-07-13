import App from "ags/gtk4/app";
import { createBinding, onCleanup } from "ags";
import { execAsync, subprocess } from "ags/process";

import style from "./style.scss";
import window_handler from "./utils/window";

import Bar from "./windows/Bar";
import PowerMenu from "./windows/PowerMenu";
import Mpris from "./windows/Mpris";
import Media from "./windows/Media";
import Glance from "./windows/Glance";
import ReplayMenu from "./windows/ReplayMenu";
import Notifications from "./windows/Notifications";

import AstalBattery from "gi://AstalBattery";
import AstalPowerProfiles from "gi://AstalPowerProfiles";
import AstalWp from "gi://AstalWp";
import AstalHyprland from "gi://AstalHyprland";
import Recorder from "./services/recorder";
import Brightness from "./services/brightness";

App.start({
    css: style,
    icons: `!!HOME/.dotfiles/assets`,
    main() {
        window_handler.register_window("powermenu", PowerMenu);
        window_handler.register_window("mpris", Mpris);
        window_handler.register_window("media", Media);
        window_handler.register_window("glance", Glance);
        window_handler.register_window("replaymenu", ReplayMenu);
        window_handler.register_window("notifications", Notifications);

        // display bar and notifications by default
        App.get_monitors().map(Bar);
        App.get_monitors().map(Notifications);

        // disable instant replay on battery
        {
            const battery = AstalBattery.get_default();
            const recorder = Recorder.get_default();

            const dispose = createBinding(battery, "charging").subscribe(() => recorder.is_replaying = battery.get_charging());
            onCleanup(() => dispose());
        }

        // control mic mute led
        {
            const audio = AstalWp.get_default();
            const brightness = Brightness.get_default();

            if (audio) {
                const dispose = createBinding(audio.default_microphone, "mute").subscribe(() => brightness.devices.forEach((device) => {
                    if (device.name === "platform::micmute") {
                        device.percentage = Number(audio.default_microphone.get_mute());
                    }
                }));

                onCleanup(() => dispose());
            }
        }

        // notify low battery
        {
            const battery = AstalBattery.get_default();
            const powerprofiles = AstalPowerProfiles.get_default();

            const dispose = createBinding(battery, "percentage").subscribe(() => {
                if (battery.charging) {
                    return;
                }

                const percent = Math.round(battery.get_percentage() * 100);

                if ([10, 15, 20].includes(percent)) {
                    if (powerprofiles.get_active_profile() === "power-saver") {
                        execAsync([
                            "notify-send",
                            "Battery Low",
                            `Battery at ${percent}%`,
                        ]);
                    }

                    else {
                        execAsync([
                            "notify-send",
                            "Battery Low",
                            "--action=power-saver=Enable Power Saving",
                        ]).then((res) => {
                            if (res === "power-saver") {
                                powerprofiles.set_active_profile("power-saver");
                            }
                        });
                    }
                }

                if (percent < 0.05) {
                    execAsync([
                        "notify-send",
                        "Battery Critical",
                        `Battery at ${percent}%`,
                        "--urgency=critical",
                    ]);
                }
            });

            onCleanup(() => dispose());
        }

        // notify recording/replay
        {
            const recorder = Recorder.get_default();

            {
                const dispose = createBinding(recorder, "is_recording").subscribe(() => {
                    if (!recorder.is_recording) {
                        return;
                    }
                    execAsync([
                        "notify-send",
                        "Recording Started",
                    ]);
                });

                onCleanup(() => dispose());
            }

            {
                const dispose = createBinding(recorder, "record_path").subscribe(() => {
                    execAsync([
                        "notify-send",
                        "Recording Saved",
                        `Saved to Path ${recorder.record_path}`,
                        "--action=view=View",
                        "--action=edit=Edit",
                    ]).then((res) => {
                        if (res === "view") {
                            subprocess(["vlc", recorder.record_path]);
                        }
                        else if (res === "edit") {
                            subprocess(["flatpak", "run", "org.gnome.gitlab.YaLTeR.VideoTrimmer", recorder.record_path]);
                        }
                    });
                });

                onCleanup(() => dispose());
            }

            {
                const dispose = createBinding(recorder, "replay_path").subscribe(() => {
                    execAsync([
                        "notify-send",
                        "Replay Saved",
                        `Saved to Path ${recorder.replay_path}`,
                        "--action=view=View",
                        "--action=edit=Edit",
                    ]).then((res) => {
                        if (res === "view") {
                            subprocess(["vlc", recorder.replay_path]);
                        }
                        else if (res === "edit") {
                            subprocess(["flatpak", "run", "org.gnome.gitlab.YaLTeR.VideoTrimmer", recorder.replay_path]);
                        }
                    });
                });

                onCleanup(() => dispose());
            }
        }
    },

    requestHandler(request: string, res: (response: any) => void) {
        const requestv = request.split(" ");

        switch (requestv[0]) {
            case "window":
                const hyprland = AstalHyprland.get_default();
                const monitor_id = hyprland.get_focused_monitor().get_id();
                const monitor = App.get_monitors()[monitor_id];

                try {
                    window_handler.toggle_window(requestv[1], monitor);
                }
                catch (error) {
                    return res(error);
                }

                return res(`window ${requestv[1]} toggled.`);

            default:
                break;
        }

        return res("does not compute");
    },
});
