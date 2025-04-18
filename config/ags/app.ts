import { App } from "astal/gtk4";
import { bind } from "astal";

import style from "./style.scss";
import window_handler from "./utils/window";

import Bar from "./windows/Bar";
import PowerMenu from "./windows/PowerMenu";
import Mpris from "./windows/Mpris";
import Media from "./windows/Media";
import Glance from "./windows/Glance";
import ReplayMenu from "./windows/ReplayMenu";

import AstalBattery from "gi://AstalBattery";
import Recorder from "./services/recorder";
import AstalWp from "gi://AstalWp";
import Hyprland from "gi://AstalHyprland";
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

        // display bar by default
        App.get_monitors().map(Bar);

        // disable instant replay on battery
        {
            const battery = AstalBattery.get_default();
            const recorder = Recorder.get_default();

            bind(battery, "charging").subscribe(charging => recorder.is_replaying = charging);
        }

        // control mic mute led
        {
            const audio = AstalWp.get_default();
            const brightness = Brightness.get_default();

            if (audio) {
                bind(audio.default_microphone, "mute").subscribe(mute => brightness.devices.forEach((device) => {
                    if (device.name === "platform::micmute") {
                        device.percentage = Number(mute);
                    }
                }));
            }
        }
    },

    requestHandler(request: string, res: (response: any) => void) {
        const requestv = request.split(" ");

        switch (requestv[0]) {
            case "window":
                const hyprland = Hyprland.get_default();
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
