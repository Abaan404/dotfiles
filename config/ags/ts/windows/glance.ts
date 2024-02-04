import Gtk from "gi://Gtk?version=3.0";
import WindowHandler from "../window.js";
import * as Widget from "resource:///com/github/Aylur/ags/widget.js";
import * as Utils from "resource:///com/github/Aylur/ags/utils.js";
import { to_timestamp, truncate } from "../utils.js";

import Network from "resource:///com/github/Aylur/ags/service/network.js";
import Bluetooth from "resource:///com/github/Aylur/ags/service/bluetooth.js";
import Battery from "resource:///com/github/Aylur/ags/service/battery.js";
import PowerProfiles from "../services/powerprofiles.js";
import Weather from "../services/weather.js";

// TODO implement entrybox for wifi and bluetooth once
// https://github.com/hyprwm/Hyprland/commit/c4da4b026deefd58f532353b64e9f17130e760ca
// available on latest release
// (currently just dummy widgets)

// TODO create a better schedule tracker that i can actually find useful

const GlanceWeather = () => {
    const revealer = Widget.Revealer({
        transition: "slide_down",
        child: Widget.Box({
            class_name: "footer",
            homogeneous: true,
            children: [
                Widget.Label({
                    halign: Gtk.Align.START,
                    label: Weather.bind("windspeed").transform(v => `${v}km/h`),
                }),
                Widget.Label({
                    halign: Gtk.Align.END,
                    label: Weather.bind("feels_like").transform(temp => `${(temp - 273.15).toFixed(1)}°C`),
                }),
            ],
        }),
    });

    return Widget.EventBox({
        class_name: "weather",
        on_primary_click: () => Utils.execAsync(["xdg-open", `https://openweathermap.org/city/${Weather.city_id}`]),
        on_hover: () => revealer.reveal_child = true,
        on_hover_lost: () => revealer.reveal_child = false,
        child: Widget.Box({
            orientation: Gtk.Orientation.VERTICAL,
            children: [
                Widget.Box({
                    spacing: 10,
                    halign: Gtk.Align.START,
                    children: [
                        Widget.Box({
                            class_name: "icon",
                            css: Weather.bind("image_path").transform(image_path => {
                                return `background: url('file://${image_path}'); background-size: 72px;`;
                            }),
                        }),
                        Widget.Box({
                            orientation: Gtk.Orientation.VERTICAL,
                            homogeneous: true,
                            children: [
                                Widget.Label({
                                    class_name: "description",
                                    halign: Gtk.Align.START,
                                    valign: Gtk.Align.END,
                                    label: Weather.bind("description"),
                                }),
                                Widget.Label({
                                    class_name: "temperature",
                                    halign: Gtk.Align.START,
                                    valign: Gtk.Align.START,
                                    // WHAT THE FUCK IS A KILOMETERRRRRRR RAHHHHH
                                    label: Weather.bind("temperature").transform(temp => `${(temp - 273.15).toFixed(1)}°C`),
                                }),
                            ],
                        }),
                    ],
                }),
                revealer,
            ],
        }),
    });
};

const GlancePower = () => Widget.Box({
    class_name: "power",
    children: [
        Widget.Box({
            orientation: Gtk.Orientation.VERTICAL,
            homogeneous: true,
            children: [
                Widget.Label({
                    class_name: "mode",
                    vpack: "end",
                    hpack: "end",
                    label: PowerProfiles.bind("mode").transform(mode => mode[0].toUpperCase() + mode.slice(1)),
                }),
                Widget.Label({
                    class_name: "uptime",
                    vpack: "end",
                    hpack: "end",
                }).poll(1000, widget => widget.label = `uptime: ${to_timestamp(parseInt(Utils.readFile("/proc/uptime")))}\n`),
            ],
        }),
        Widget.Icon({
            class_name: "icon",
            icon: PowerProfiles.bind("icon_name"),
        }),
    ],
});

const GlanceNetwork = () => Widget.Box({
    class_name: "network",
    orientation: Gtk.Orientation.VERTICAL,
    spacing: 10,
    children: [
        Widget.Box({
            hpack: "center",
            hexpand: true,
            spacing: 10,
            children: [
                Widget.Icon({
                    icon: Network.bind("primary").transform(primary => primary === "wifi" ? Network.wifi.icon_name : Network.wifi.icon_name),
                }),
                Widget.Label({
                    label: Network.bind("connectivity"),
                }),
            ],
        }),
        Widget.Scrollable({
            vexpand: true,
            child: Widget.Box({
                orientation: Gtk.Orientation.VERTICAL,
                setup: widget => {
                    widget.hook(Bluetooth, widget => {
                        widget.children = Network.wifi.access_points.map(device => Widget.EventBox({
                            hexpand: true,
                            class_name: "entry",
                            child: Widget.Box({
                                spacing: 5,
                                children: [
                                    Widget.Icon({ class_name: "icon", icon: device.iconName }),
                                    Widget.Label({ class_name: "alias", label: truncate(device.ssid || "Unknown", 18) }),
                                ],
                            }),
                        }));
                    });
                },
            }),
        }),
    ],
});

const GlanceBluetooth = () => Widget.Box({
    class_name: "bluetooth",
    orientation: Gtk.Orientation.VERTICAL,
    spacing: 10,
    children: [
        Widget.Box({
            hpack: "center",
            hexpand: true,
            spacing: 10,
            children: [
                Widget.Icon("bluetooth-symbolic"),
                Widget.Label().hook(Bluetooth, widget => {
                    widget.label = truncate(Bluetooth.connected_devices[0]?.alias || "Disconnected", 28);
                }, "notify::connected-devices"),
            ],
        }),
        Widget.Scrollable({
            vexpand: true,
            child: Widget.Box({
                orientation: Gtk.Orientation.VERTICAL,
                setup: widget => {
                    widget.hook(Bluetooth, widget => {
                        widget.children = Bluetooth.devices.map(device => Widget.EventBox({
                            hexpand: true,
                            class_name: "entry",
                            child: Widget.Box({
                                spacing: 5,
                                children: [
                                    Widget.Icon({ class_name: "icon", icon: "bluetooth-symbolic" }),
                                    Widget.Label({ class_name: "alias", label: truncate(device.alias || "Unknown", 18) }),
                                ],
                            }),
                        }));
                    }, "notify::connected-devices");
                },
            }),
        }),
    ],
});

const GlanceCalendar = () => Widget.Box({
    class_name: "calendar",
    orientation: Gtk.Orientation.VERTICAL,
    children: [
        Widget.Label({
            class_name: "clock",
        }).poll(1000, widget => {
            const datetime = new Date();
            return widget.label = `${String(datetime.getHours()).padStart(2, "0")} : ${String(datetime.getMinutes()).padStart(2, "0")} : ${String(datetime.getSeconds()).padStart(2, "0")}`;
        }),
        Widget.Calendar({}),
    ],
});

const GlanceSettings = () => {
    const GlancePages = Widget.Stack({
        transition: "slide_up_down",
        children: {
            ["network"]: GlanceNetwork(),
            ["bluetooth"]: GlanceBluetooth(),
            ["calendar"]: GlanceCalendar(),
        },
        setup: widget => widget.shown = "calendar",
    });

    const GlanceControls = Widget.Box({
        class_name: "controls",
        spacing: 20,
        valign: Gtk.Align.FILL,
        orientation: Gtk.Orientation.VERTICAL,
        homogeneous: true,
        children: [
            // Network
            Widget.EventBox({
                on_primary_click: () => GlancePages.shown = "network",
                child: Widget.CircularProgress({
                    rounded: true,
                    setup: widget => {
                        widget.hook(Network, widget => {
                            switch (Network.primary) {
                                case "wifi":
                                    Utils.interval(5000, () => {
                                        widget.value = Network.wifi.strength / 100;
                                    }, widget);
                                    widget.rounded = true;
                                    widget.child = Widget.Icon({
                                        icon: Network.wifi.bind("icon_name"),
                                    });
                                    break;

                                case "wired":
                                    widget.value = 1.0,
                                    widget.child = Widget.Icon({
                                        icon: Network.wired.bind("icon_name"),
                                    });

                                default:
                                    widget.rounded = false;
                                    widget.child = Widget.Icon({
                                        icon: "network-wireless-signal-none-symbolic",
                                    });
                                    break;
                            }

                            widget.show_all();
                        });
                    },
                }),
            }),

            // bluetooth
            Widget.EventBox({
                on_primary_click: () => GlancePages.shown = "bluetooth",
                child: Widget.CircularProgress({
                    rounded: true,
                    child: Widget.Icon({ icon: "bluetooth-symbolic" }),
                    setup: widget => {
                        widget.hook(Bluetooth, widget => {
                            if (Bluetooth.connected_devices.length > 0) {
                                widget.value = Bluetooth.connected_devices[0].battery_percentage / 100;
                                widget.rounded = true;
                            }
                            else {
                                widget.value = 0.0;
                                widget.rounded = false;
                            }
                        });
                    },
                }),
            }),

            // battery
            Widget.EventBox({
                child: Widget.CircularProgress({
                    value: Battery.bind("percent").transform(val => val / 100),
                    child: Widget.Icon({ icon: Battery.bind("icon_name") }),
                }),
            }),

            // day percent (calendar)
            Widget.EventBox({
                on_primary_click: () => GlancePages.shown = "calendar",
                child: Widget.CircularProgress({
                    child: Widget.Icon({ icon: "timer-symbolic" }),
                    setup: widget => Utils.interval(60000, () => {
                        const datetime = new Date();
                        const now = datetime.getHours() * 60 + datetime.getMinutes();
                        const total = 24 * 60;
                        widget.value = now / total;
                    }, widget),
                }),
            }),
        ],
    });

    return [
        GlancePages,
        GlanceControls,
    ];
};

const RowOne = () => Widget.Box({
    spacing: 20,
    children: [
        Widget.Box({
            spacing: 20,
            orientation: Gtk.Orientation.VERTICAL,
            children: [
                GlanceWeather(),
                GlancePower(),
            ],
        }),
        Widget.Box({
            class_name: "quick-settings",
            spacing: 20,
            children: GlanceSettings(),
        }),
    ],
});

export default () => WindowHandler.new_window({
    class_name: "glance",
    window: {
        anchor: ["top", "right"],
    },
    box: {
        spacing: 10,
        orientation: Gtk.Orientation.VERTICAL,
    },
    children: [
        RowOne(),
    ],
});
