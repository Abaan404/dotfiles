import App from "resource:///com/github/Aylur/ags/app.js";
import WindowHandler from "../window.js";
import * as Widget from "resource:///com/github/Aylur/ags/widget.js";
import * as Utils from "resource:///com/github/Aylur/ags/utils.js";
import * as Variables from "../variables.js";
import { commands, get_player_glyph, symbolic_strength, truncate } from "../utils.js";

import Hyprland from "resource:///com/github/Aylur/ags/service/hyprland.js";
import Mpris from "resource:///com/github/Aylur/ags/service/mpris.js";
import Network from "resource:///com/github/Aylur/ags/service/network.js";
import Battery from "resource:///com/github/Aylur/ags/service/battery.js";
import Audio from "resource:///com/github/Aylur/ags/service/audio.js";
import Bluetooth from "resource:///com/github/Aylur/ags/service/bluetooth.js";
import SystemTray from "resource:///com/github/Aylur/ags/service/systemtray.js";

import { EventBoxProps } from "types/widgets/eventbox.js";
import { BoxProps } from "types/widgets/box.js";

interface BarWidgetProps {
    class_name: string;
    eventbox?: EventBoxProps;
    box?: BoxProps;
}

function BarWidget({ class_name, eventbox, box }: BarWidgetProps) {
    return Widget.EventBox({
        class_name: class_name,
        ...eventbox,
        child: Widget.Box({
            class_name: "widget",
            ...box,
        }),
    });
}

const launcher_revealer = Widget.Revealer({
    transition: "slide_left",
    transitionDuration: 500,
    child: Widget.Label("Launcher"),
    css: "padding-left: 10px;", // add padding when shown
});

const BarLauncher = BarWidget({
    class_name: "launcher",
    eventbox: {
        on_primary_click: () => Utils.execAsync(["pkill", "rofi"])
            .catch(() => Utils.execAsync(["rofi", "-show", "drun"]))
            .catch(() => undefined),
        on_hover: () => launcher_revealer.reveal_child = true,
        on_hover_lost: () => launcher_revealer.reveal_child = false,
    },
    box: {
        children: [
            Widget.Icon({
                icon: "!!HOME/.config/ags/assets/launcher.png",
                size: 16,
            }),
            launcher_revealer,
        ],
    },
});

const BarWorkspaces = BarWidget({
    class_name: "workspaces",
    box: {
        spacing: 20,
        setup: widget => {
            widget.hook(Hyprland, widget => {
                // persistent workspaces
                const workspaces = [
                    { id: 1, glyph: "" },
                    { id: 2, glyph: "" },
                    { id: 3, glyph: "" },
                    { id: 4, glyph: "" },
                ];

                Hyprland.workspaces
                    .sort((a, b) => a.id - b.id)
                    // named workspaces have negative indices
                    .filter(ws => ws.id > workspaces[workspaces.length - 1].id)
                    .forEach(ws => workspaces.push({ id: ws.id, glyph: "" }));

                widget.children = workspaces.map(ws => Widget.Button({
                    class_name: Hyprland.active.workspace.id === ws.id ? "active" : "inactive",
                    child: Widget.Label({ label: ws.glyph }),
                    on_primary_click: () => Utils.execAsync(`hyprctl dispatch workspace ${ws.id}`),
                }));
            });
        },
    },
});

const BarSysTray = Widget.Revealer({
    transition: "slide_left",
    transitionDuration: 500,
    child: BarWidget({
        class_name: "systray",
        box: {
            // @ts-ignore https://github.com/Aylur/ags/issues/262
            children: SystemTray.bind("items").transform(items => {
                return items.map(item => Widget.Button({
                    on_primary_click: () => item.openMenu(null),
                    child: Widget.Icon({
                        // @ts-ignore I have no idea how to deal with a pixbuff
                        icon: item.bind("icon"),
                        size: 18,
                    }),
                }));
            }),
        },
    }),
});

const BarSysInfo = BarWidget({
    class_name: "sysinfo",
    eventbox: {
        on_primary_click: () => BarSysTray.reveal_child = !BarSysTray.reveal_child,
        on_middle_click: () => App.Inspector(),
    },
    box: {
        spacing: 12,
        children: [
            Widget.Label(" 0.0G").poll(5000, widget => Utils.execAsync(["bash", "-c", "free -hg | awk 'NR == 2 {print $3}' | sed 's/Gi/G/'"])
                .then(out => widget.label = ` ${out}`),
            ),
            Widget.Label(" 0.0%").poll(5000, widget => Utils.execAsync(["bash", "-c", "top -bn1 | sed -n '/Cpu/p' | awk '{print $2}' | sed 's/..,//'"])
                .then(out => widget.label = ` ${out}%`),
            ),
        ],
    },
});

const BarPlayer = BarWidget({
    class_name: "player",
    eventbox: {
        visible: Variables.PlayerSelected.bind().transform(selected => <number>selected >= 0),
        on_primary_click: () => WindowHandler.toggle_window("player"),
        on_secondary_click: () => {
            if (Mpris.players[Variables.PlayerSelected.value]?.can_go_next)
                Mpris.players[Variables.PlayerSelected.value].next();
        },
        on_middle_click: () => {
            if (Mpris.players[Variables.PlayerSelected.value]?.can_play)
                Mpris.players[Variables.PlayerSelected.value].playPause();
        },
    },
    box: {
        spacing: 20,
        setup: widget => {
            widget.hook(Mpris, widget => {
                if (Variables.PlayerSelected.value < 0)
                    return;

                const player = Mpris.players[Variables.PlayerSelected.value];
                const title = player.track_title;
                const artists = player.track_artists;

                widget.visible = !(title.length || artists.join("").length);

                // display string
                let player_string = title;
                if (artists.length > 0 && artists[0].length > 0)
                    player_string = `${truncate(artists[0], 30)} - ${truncate(title, 30)}`;

                widget.children = [
                    Widget.Label(get_player_glyph(player.name)),
                    Widget.Label(player_string),
                ];
            }, "player-changed");
        },
    },
});

const BarMedia = BarWidget({
    class_name: "media",
    eventbox: {
        setup: widget => {
            widget.hook(Bluetooth, widget => {
                let connected = false;
                Bluetooth.devices.forEach(
                    element => connected ||= element.connected,
                );

                connected
                    ? widget.get_style_context().add_class("bluetooth")
                    : widget.get_style_context().remove_class("bluetooth");
            });

            widget.hook(Audio, widget => {
                Audio.speaker?.is_muted
                    ? widget.get_style_context().add_class("muted")
                    : widget.get_style_context().remove_class("muted");
            }, "speaker-changed");
        },
        on_primary_click: () => WindowHandler.toggle_window("media"),
    },
    box: {
        spacing: 10,
        children: [
            Widget.EventBox({
                on_scroll_up: () => {
                    const speaker = Audio.speaker;
                    if (speaker)
                        speaker.volume += 0.1;
                },
                on_scroll_down: () => {
                    const speaker = Audio.speaker;
                    if (speaker)
                        speaker.volume -= 0.1;
                },
                on_middle_click: () => {
                    const speaker = Audio.speaker;
                    if (speaker)
                        speaker.is_muted = !speaker.is_muted;
                },
                child: Widget.Box({
                    class_name: "sink",
                    spacing: 6,
                    children: [
                        Widget.Label().hook(Audio, widget => {
                            if (!Audio.speaker)
                                widget.label = "󰖁 ";
                            else if (Audio.speaker.is_muted)
                                widget.label = "󰝟 ";
                            else if (Audio.speaker.stream.port === "headphone-output"
                                  || Audio.speaker.stream.port === "analog-output-headphones")
                                widget.label = " ";
                            else
                                widget.label = symbolic_strength({
                                    value: Audio.speaker.volume,
                                    max: 1,
                                    array: ["󰖀 ", "󰕾 "],
                                });
                        }, "speaker-changed"),

                        Widget.Label().hook(Audio, widget => {
                            if (!Audio.speaker)
                                return;

                            widget.label = `${Math.ceil(Audio.speaker.volume * 100)}%`;
                            widget.visible = !(Audio.speaker.is_muted);
                        }, "speaker-changed"),
                    ],
                }),
            }),
            Widget.EventBox({
                on_scroll_up: () => {
                    const microphone = Audio.microphone;
                    if (microphone)
                        microphone.volume += 0.100;
                },
                on_scroll_down: () => {
                    const microphone = Audio.microphone;
                    if (microphone)
                        microphone.volume -= 0.100;
                },
                on_middle_click: () => {
                    const microphone = Audio.microphone;
                    if (microphone)
                        microphone.is_muted = !microphone.is_muted;
                },
                child: Widget.Box({
                    class_name: "source",
                    spacing: 1,
                    children: [
                        Widget.Label().hook(Audio, widget => {
                            if (!Audio.microphone || Audio.microphone.is_muted)
                                widget.label = " ";
                            else
                                widget.label = " ";
                        }, "microphone-changed"),

                        Widget.Label().hook(Audio, widget => {
                            if (!Audio.microphone)
                                return;

                            widget.label = `${Math.ceil(Audio.microphone.volume * 100)}%`;
                            widget.visible = !(Audio.microphone.is_muted);
                        }, "microphone-changed"),
                    ],
                }),
            }),
        ],
    },
});

const cock_revealer = Widget.Revealer({
    transition: "slide_left",
    transitionDuration: 500,
    css: "padding-left: 10px;", // add padding when shown
    child: Widget.Label().poll(1000, widget => {
        const datetime = new Date();
        const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][datetime.getDay()];
        const month = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December",
        ][datetime.getMonth()];
        const year = datetime.getFullYear();
        const date = String(datetime.getDate()).padStart(2, "0");
        widget.label = `${day}, ${date} ${month} ${year}`;
    }),
});

const BarCockInfo = Widget.EventBox({
    class_name: "clock",
    on_hover: () => cock_revealer.reveal_child = true,
    on_hover_lost: () => cock_revealer.reveal_child = false,
    child: Widget.Box({
        children: [
            Widget.Label({
                class_name: "glyph",
            }).poll(1000, widget => widget.label = new Date().toLocaleTimeString("en-gb", { hour: "2-digit", minute: "2-digit" })),
            cock_revealer,
        ],
    }),
});

const battery_revealer = Widget.Revealer({
    transition: "slide_left",
    transitionDuration: 500,
    css: "padding-left: 5px;", // add padding when shown
    child: Widget.Label({
        label: Battery.bind("percent").transform(percent => percent.toString()),
    }),
});

const BarBatteryInfo = Widget.EventBox({
    class_name: "battery",
    on_scroll_up: () => Utils.execAsync(commands.brightness.increase),
    on_scroll_down: () => Utils.execAsync(commands.brightness.decrease),
    on_hover: () => battery_revealer.reveal_child = true,
    on_hover_lost: () => battery_revealer.reveal_child = false,
    child: Widget.Box({
        children: [
            Widget.Label({
                class_name: "glyph",
                setup: widget => {
                    widget.hook(Battery, widget => {
                        if (Battery.percent < 0) // -1 is an odd default choice but ok
                            return;

                        widget.label = symbolic_strength({
                            value: Battery.percent,
                            array: [" ", " ", " ", " ", " "],
                        });
                    });
                },
            }),
            battery_revealer,
        ],
    }),
});

const network_revealer = Widget.Revealer({
    transition: "slide_left",
    transitionDuration: 500,
    css: "padding-left: 5px;", // add padding when shown
    child: Widget.Label({
        label: Network.wifi.bind("ssid").transform(ssid => ssid || "Offline"),
    }),
});

const BarNetworkInfo = Widget.EventBox({
    class_name: "network",
    on_hover: () => network_revealer.reveal_child = true,
    on_hover_lost: () => network_revealer.reveal_child = false,
    child: Widget.Box({
        children: [
            Widget.Label({
                class_name: "disconnected", // disconnected initially
            }).hook(Network, widget => {
                if (!Network.wifi || !Network.wired)
                    return;

                widget.class_name = Network.wifi.internet;

                if (Network.primary === "wired")
                    widget.label = " ";

                else if (Network.wifi.internet === "connected")
                    widget.label = symbolic_strength({
                        value: Network.wifi.strength,
                        array: ["󰤯 ", "󰤟 ", "󰤢 ", "󰤥 "],
                    });

                else if (Network.wifi.internet === "connecting")
                    widget.label = symbolic_strength({
                        value: Network.wifi.strength,
                        array: ["󰤫 ", "󰤠 ", "󰤣 ", "󰤦 "],
                    });

                else
                    widget.label = "󰤭 ";
            }),
            network_revealer,
        ],
    }),
});

const BarInfo = BarWidget({
    class_name: "info",
    eventbox: {
        on_primary_click: () => WindowHandler.toggle_window("glance"),
    },
    box: {
        spacing: 10,
        children: [
            BarBatteryInfo,
            BarNetworkInfo,
            BarCockInfo,
        ],
    },
});

const power_revealer = Widget.Revealer({
    transition: "slide_left",
    transitionDuration: 500,
    child: Widget.Label("exit"),
    css: "padding-left: 10px;", // add padding when shown
});

const BarPower = BarWidget({
    class_name: "power",
    eventbox: {
        on_primary_click: () => WindowHandler.toggle_window("powermenu"),
        on_hover: () => power_revealer.reveal_child = true,
        on_hover_lost: () => power_revealer.reveal_child = false,
    },
    box: {
        children: [Widget.Label({ label: "⏼", css: "padding-right: 5px" })],
    },
});

export default () => Widget.Window({
    name: "bar",
    anchor: ["top", "left", "right"],
    exclusivity: "exclusive",
    child: Widget.CenterBox({
        class_name: "bar",
        start_widget: Widget.Box({
            spacing: 10,
            hpack: "start",
            children: [
                BarLauncher,
                BarWorkspaces,
                BarSysInfo,
                BarSysTray,
            ],
        }),
        center_widget: Widget.Box({
            spacing: 10,
            hpack: "center",
            children: [
                BarPlayer,
            ],
        }),
        end_widget: Widget.Box({
            spacing: 10,
            hpack: "end",
            children: [
                BarMedia,
                BarInfo,
                BarPower,
            ],
        }),
    }),
});
