import { commands, symbolic_strength } from "../utils.js";

import { Hyprland, Mpris, Network, Battery, Audio, Bluetooth, SystemTray } from "../imports.js";

import { Utils, Widget } from "../imports.js";

// TODO figure out how to have multiple event box do hover properly

const BarWidget = ({ className, eventbox, ...box }) => Widget.EventBox({
    className: className,
    setup: widget => widget.set_above_child(true),
    ...eventbox,
    child: Widget.Box({
        className: "widget",
        ...box,
    }),
});

const Launcher = BarWidget({
    className: "launcher",
    eventbox: {
        onPrimaryClick: () => {
            Utils.execAsync(["pkill", "rofi"])
                .catch(() => Utils.execAsync(["rofi", "-show", "drun"]).catch(() => null))
        },
        onHover: widget => widget.child.children[1].reveal_child = true,
        onHoverLost: widget => widget.child.children[1].reveal_child = false
    },
    children: [
        Widget.Icon({
            icon: "!!HOME/.config/eww/images/launcher.png",
            size: 16,
        }),
        Widget.Revealer({
            transition: "slide_left",
            transitionDuration: 500,
            child: Widget.Label("Launcher"),
            style: "padding-left: 10px;", // add padding when shown
        })
    ]
});

const Workspaces = BarWidget({
    className: "workspaces",
    spacing: 20,
    connections: [[Hyprland, widget => {
        const workspaces = [
            {"id": 1, "glyph": ""},
            {"id": 2, "glyph": ""},
            {"id": 3, "glyph": ""},
            {"id": 4, "glyph": ""}
        ];

        const persistent_id = workspaces.map(ws => ws.id)
        Array(...Hyprland.workspaces.keys())
            .sort()
            .map(ws => {
                if (!persistent_id.includes(ws) && ws > 0)
                    workspaces.push({"id": ws, "glyph": ""});
            })

        widget.children = workspaces.map(ws => Widget.Button({
            className: Hyprland.active.workspace.id == ws.id ? 'active' : 'inactive',
            child: Widget.Label({ label: `${ws.glyph}` }),
            onPrimaryClick: `hyprctl dispatch workspace ${ws}`,
        }));
    }]]
})

const SysInfo = BarWidget({
    className: "sysinfo",
    spacing: 12,
    children: [
        Widget.Label({
            label: " 0.0G",
            connections: [[2000, widget => Utils.execAsync(["bash", "-c", "free -hg | awk 'NR == 2 {print $3}' | sed 's/Gi/G/'"])
                .then(out => widget.label = ` ${out}`)]
            ]
        }),
        Widget.Label({
            label: " 0.0%",
            connections: [[2000, widget => Utils.execAsync(["bash", "-c", "top -bn1 | sed -n '/Cpu/p' | awk '{print $2}' | sed 's/..,//'"])
                .then(out => widget.label = ` ${out}%`)]
            ]
        })
    ]
})

// todo impl this
const SysTray = BarWidget({
    className: "systray",
    connections: [[SystemTray, widget => {
        SystemTray.items.forEach(item => {
            widget.children.push(
                Widget.Button({
                    label: item.title,
                    onPrimaryClick: btn => item.openMenu(null),
                })
            )
        })
    }]]
})

const Player = BarWidget({
    className: "player",
    eventbox: {
        onPrimaryClick: "eww open --toggle player",
        onSecondaryClick: commands.player.next,
        onMiddleClick: commands.player.toggle
    },
    spacing: 20,
    connections: [[Mpris, widget => {
        if (!Mpris.getPlayer())
            return

        const title = Mpris.getPlayer().trackTitle;
        const artists = Mpris.getPlayer().trackArtists;

        // display string
        let player_string;
        if (artists[0].trim() === "")
            player_string = `${title}`
        else
            player_string = `${artists[0]} - ${title}`

        // truncate string if too long
        if (player_string.length >= 35)
            player_string = player_string.slice(0, 35) + "..."

        // display glyph
        let player_glyph;
        switch (Mpris.getPlayer().name) {
            case "firefox":
                player_glyph = "";
                break;
            case "spotify":
                player_glyph = "";
                break
            case "discord":
                player_glyph = "";
                break
            default:
                player_glyph = "";
                break;
        }

        widget.children = [
            Widget.Label(`${player_glyph}`),
            Widget.Label(`${player_string}`)
        ]
    }]]
})

const Media = BarWidget({
    className: "media",
    spacing: 10,
    eventbox: {
        setup: widget => widget.set_above_child(false),
        onPrimaryClick: () => toggle_audio(),
        connections: [
            [Bluetooth, widget => {
                let connected = false;
                [ ...Bluetooth.devices.values() ]
                    .forEach(element => connected ||= element.connected)

                connected
                    ? widget.get_style_context().add_class("bluetooth")
                    : widget.get_style_context().remove_class("bluetooth");
            }],
            [Audio, widget => {
                Audio.speaker?.stream.isMuted
                    ? widget.get_style_context().add_class("muted")
                    : widget.get_style_context().remove_class("muted");
            }, "speaker-changed"]
        ]
    },
    children: [
        Widget.EventBox({
            setup: widget => widget.set_above_child(true),
            onScrollUp: commands.sink.increase,
            onScrollDown: commands.sink.decrease,
            onMiddleClick: commands.sink.mute,
            child: Widget.Box({
                className: "sink",
                spacing: 6,
                children: [
                    Widget.Label({
                        connections: [[Audio, widget => {
                            if (!Audio.speaker)
                                widget.label = "󰖁 ";
                            else if (Audio.speaker.stream.isMuted)
                                widget.label = "󰝟 ";
                            else if (Audio.speaker._stream.port === "headphone-output")
                                widget.label = " ";
                            else
                                widget.label = symbolic_strength({
                                    value: Audio.speaker.volume,
                                    max: 1,
                                    array: ["󰖀 ", "󰕾 "]
                                });

                        }, "speaker-changed"]]
                    }),
                    Widget.Label({
                        connections: [[Audio, widget => {
                            if (!Audio.speaker)
                                return

                            widget.label = String(Math.floor(Audio.speaker.volume * 100)) + "%";
                            widget.visible = !(Audio.speaker.stream.isMuted);

                        }, "speaker-changed"]]
                    })
                ]
            })
        }),
        Widget.EventBox({
            setup: widget => widget.set_above_child(true),
            onScrollUp: commands.source.increase,
            onScrollDown: commands.source.decrease,
            onMiddleClick: commands.source.mute,
            child: Widget.Box({
                className: "source",
                spacing: 1,
                children: [
                    Widget.Label({
                        connections: [[Audio, widget => {
                            if (!Audio.microphone || Audio.microphone.stream.isMuted || Audio.microphone.volume === 0)
                                widget.label = " ";
                            else
                                widget.label = " ";

                        }, "microphone-changed"]]
                    }),
                    Widget.Label({
                        connections: [[Audio, widget => {
                            if (!Audio.microphone)
                                return

                            widget.label = String(Math.floor(Audio.microphone.volume * 100)) + "%";
                            widget.visible = !(Audio.microphone.stream.isMuted || Audio.microphone.volume === 0)

                        }, "microphone-changed"]]
                    })
                ]
            })
        })
    ]
})

const CockInfo = Widget.EventBox({
    className: "clock",
    setup: widget => widget.set_above_child(true),
    onHover: widget => widget.child.children[1].reveal_child = true,
    onHoverLost: widget => widget.child.children[1].reveal_child = false,
    child: Widget.Box({
        children: [
            Widget.Label({
                className: "glyph",
                connections: [[1000, widget => widget.label = new Date().toLocaleTimeString("en-gb", { hour: "2-digit", minute: "2-digit" })]]
            }),
            Widget.Revealer({
                transition: "slide_left",
                transitionDuration: 500,
                style: "padding-left: 10px;", // add padding when shown
                child: Widget.Label({
                    connections: [[1000, widget => {
                        const datetime = new Date();
                        const day = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][datetime.getDay() - 1];
                        const month = ["January", "February", "March", "April", "May", "June",
                            "July", "August", "September", "October", "November", "December"][datetime.getMonth()];
                        const year = datetime.getFullYear();
                        const date = String(datetime.getDate()).padStart(2, "0");
                        widget.label = `${day}, ${date} ${month} ${year}`
                    }]]
                }),
            })
        ]}
    )
})

const BatteryInfo = Widget.EventBox({
    className: "battery",
    setup: widget => widget.set_above_child(true),
    onScrollUp: commands.brightness.increase,
    onScrollDown: commands.brightness.decrease,
    onHover: widget => widget.child.children[1].reveal_child = true,
    onHoverLost: widget => widget.child.children[1].reveal_child = false,
    child: Widget.Box({
        children: [
            Widget.Label({
                className: "glyph",
                connections: [[Battery, widget => {
                    if (Battery.percent < 0) // -1 is an odd default choice but ok
                    return

                    widget.label = symbolic_strength({
                        value: Battery.percent,
                        array: [ " ", " ", " ", " ", " " ]
                    })
                }]]
            }),
            Widget.Revealer({
                transition: "slide_left",
                transitionDuration: 500,
                style: "padding-left: 5px;", // add padding when shown
                child: Widget.Label({
                    connections: [[Battery, widget => widget.label = Battery.percent.toString() + "%"]]
                }),
            })
        ]}
    )
})

const NetworkInfo = Widget.EventBox({
    className: "network",
    setup: widget => widget.set_above_child(true),
    onHover: widget => widget.child.children[1].reveal_child = true,
    onHoverLost: widget => widget.child.children[1].reveal_child = false,
    child: Widget.Box({
        children: [
            Widget.Label({
                className: "disconnected",
                connections: [[Network, widget => {
                    if (!Network.wifi || !Network.wired)
                        return

                    if (Network.primary === "wired") {
                        widget.className = Network.wifi.internet;
                        widget.label = " ";

                    } else {
                        widget.className = Network.wifi.internet;
                        if (Network.wifi.internet === "connected")
                            widget.label = symbolic_strength({
                                value: Network.wifi.strength,
                                array: ["󰤯 ", "󰤟 ", "󰤢 ", "󰤥 "]
                            });
                        else if (Network.wifi.internet === "connecting")
                            widget.label = symbolic_strength({
                                value: Network.wifi.strength,
                                array: ["󰤫 ", "󰤠 ", "󰤣 ", "󰤦 "]
                            });
                        else
                            widget.label = "󰤭 ";
                    }
                }]]
            }),
            Widget.Revealer({
                transition: "slide_left",
                transitionDuration: 500,
                style: "padding-left: 5px;", // add padding when shown
                child: Widget.Label({
                    connections: [[Network, widget => widget.label = Network.wifi?.ssid ?? "Offline"]]
                })
            })
        ]
    })
})

const Info = BarWidget({
    className: "info",
    eventbox: {
        setup: widget => widget.set_above_child(false),
        onPrimaryClick: "eww open --toggle glance"
    },
    spacing: 10,
    children: [
        BatteryInfo,
        NetworkInfo,
        CockInfo
    ]
})

const Power = BarWidget({
    className: "power",
    eventbox: {
        onPrimaryClick: () => toggle_powermenu(),
        onHover: widget => widget.child.children[1].reveal_child = true,
        onHoverLost: widget => widget.child.children[1].reveal_child = false
    },
    children: [
        Widget.Label({label: "⏼", style: "padding-right: 5px"}),
        Widget.Revealer({
            transition: "slide_left",
            transitionDuration: 500,
            child: Widget.Label("exit"),
            style: "padding-left: 10px;", // add padding when shown
        })
    ]
});

export const Bar = Widget.Window({
    name: "bar",
    anchor: ["top", "left", "right"],
    exclusive: true,
    child: Widget.CenterBox({
        className: "bar",
        startWidget: Widget.Box({
            spacing: 10,
            halign: 'start',
            children: [
                Launcher,
                Workspaces,
                SysInfo,
                // SysTray
            ],
        }),
        centerWidget: Widget.Box({
            spacing: 10,
            halign: 'center',
            children: [
                Player
            ]
        }),
        endWidget: Widget.Box({
            spacing: 10,
            halign: 'end',
            children: [
                Media,
                Info,
                Power
            ]
        }),
    }),
});
