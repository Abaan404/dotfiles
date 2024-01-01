import Gtk from "gi://Gtk?version=3.0";
import Widget from "resource:///com/github/Aylur/ags/widget.js";

// services
import Audio from "resource:///com/github/Aylur/ags/service/audio.js";

// utils
import { execAsync } from "resource:///com/github/Aylur/ags/utils.js";
import { commands } from "../utils.js";
import { new_window } from "../window.js";

// types
import { SliderProps } from "types/widgets/slider.js";
import { LabelProps } from "types/widgets/label.js";
import { ButtonProps } from "types/widgets/button.js";

interface MediaSliderProps {
    label: LabelProps;
    mute: ButtonProps;
    other_devices: Gtk.Box;
    slider: SliderProps;
}

const MediaSlider = ({ label, mute, other_devices, slider }: MediaSliderProps) => {
    const device_revealer = Widget.Revealer({
        transition: "slide_down",
        transitionDuration: 500,
        css: "padding-top: 10px;",
        child: other_devices,
    });

    return Widget.Box({
        class_name: "volume-box",
        orientation: Gtk.Orientation.VERTICAL,
        children: [
            Widget.Box({
                spacing: 10,
                children: [
                    Widget.Label({
                        class_names: ["default", "name"],
                        hexpand: true,
                        hpack: "start",
                        // @ts-ignore i have no idea why ts doesnt like this line
                        // though it should be fine
                        ...label,
                    }),
                    Widget.Button({
                        class_name: "mute",
                        ...mute,
                    }),
                    Widget.Button({
                        class_name: "list",
                        on_primary_click: () => device_revealer.reveal_child = !(device_revealer.reveal_child),
                        child: Widget.Label(" "),
                    }),
                ],
            }),
            device_revealer,
            Widget.Slider({
                drawValue: false,
                min: 0,
                max: 100,
                ...slider,
            }),
        ],
    });
};

export default () => new_window({
    class_name: "media",
    window: {
        anchor: ["top", "right"],
    },
    box: {
        spacing: 10,
        orientation: Gtk.Orientation.VERTICAL,
    },
    children: [
        MediaSlider({
            label: {
                setup: widget => {
                    widget.bind("label", Audio, "speaker", speaker => {
                        let label = speaker?.description;

                        switch (speaker?.stream.port) {
                            case "headphone-output":
                            case "analog-output-headphones":
                                label = "  " + label;
                                break;

                            case undefined:
                                label = "  Invalid Device";
                                break;

                            default:
                                label = "  " + label;
                                break;
                        }

                        // truncate string if too long
                        if (label.length >= 35)
                            label = `${label.slice(0, 35)}...`;

                        return label;
                    });
                },
            },
            mute: {
                on_primary_click: () => {
                    const speaker = Audio.speaker;
                    if (speaker)
                        speaker.is_muted = !speaker.is_muted;
                },
                setup: widget => {
                    widget.hook(Audio, widget => widget.label = Audio.speaker?.is_muted ? "󰖁 " : "󰕾 ",
                        "speaker-changed");
                },
            },
            slider: {
                setup: widget => {
                    widget.hook(Audio, widget => widget.value = (Audio.speaker?.volume || 0) * 100,
                        "speaker-changed");
                },
                on_change: ({ value }) => {
                    if (!Audio.speaker)
                        return;

                    Audio.speaker.volume = value / 100;
                },
            },
            other_devices: Widget.Box({
                orientation: Gtk.Orientation.VERTICAL,
                spacing: 10,
                hpack: "start",
                setup: widget => {
                    widget.hook(Audio, widget => {
                        widget.children = Audio.speakers
                            .filter(speaker => speaker.name !== Audio.speaker?.name)
                            .map(speaker => {
                                let label = speaker.description;
                                switch (speaker.stream.port) {
                                    case "headphone-output":
                                    case "analog-output-headphones":
                                        label = "  " + label;
                                        break;

                                    default:
                                        label = "  " + label;
                                        break;
                                }

                                // truncate string if too long
                                if (label.length >= 40)
                                    label = `${label.slice(0, 40)}...`;

                                return Widget.Button({
                                    class_name: "name",
                                    on_primary_click: () => Audio.speaker = speaker,
                                    child: Widget.Label({
                                        hpack: "start",
                                        hexpand: true,
                                        label: label,
                                    }),
                                });
                            });
                    }, "speaker-changed");
                },
            }),
        }),
        MediaSlider({
            label: {
                setup: widget => {
                    widget.bind("label", Audio, "microphone", microphone => {
                        let label = "  " + (microphone?.description || "Invalid Device");

                        // truncate string if too long
                        if (label.length >= 35)
                            label = `${label.slice(0, 35)}...`;
                        return label;
                    });
                },
            },
            mute: {
                on_primary_click: () => {
                    const microphone = Audio.microphone;
                    if (microphone)
                        microphone.is_muted = !microphone.is_muted;
                },
                child: Widget.Label().hook(Audio, widget => {
                    widget.label = Audio.microphone?.is_muted ? " " : " ";
                }, "microphone-changed"),
            },
            slider: {
                setup: widget => {
                    widget.hook(Audio, widget => {
                        widget.value = (Audio.microphone?.volume || 0) * 100;
                    }, "microphone-changed");
                },
                on_change: ({ value }) => {
                    if (!Audio.microphone)
                        return;
                    Audio.microphone.volume = value / 100;
                },
            },
            other_devices: Widget.Box({
                orientation: Gtk.Orientation.VERTICAL,
                spacing: 10,
                hpack: "start",
                setup: widget => {
                    widget.hook(Audio, widget => {
                        widget.children = Audio.microphones
                            .filter(microphone => microphone.name !== Audio.microphone?.name)
                            .map(microphone => {
                                let label = "  " + microphone.description;

                                // truncate string if too long
                                if (label.length >= 40)
                                    label = label.slice(0, 40) + "...";

                                return Widget.Button({
                                    class_name: "name",
                                    on_primary_click: () => Audio.microphone = microphone,
                                    child: Widget.Label({
                                        hpack: "start",
                                        hexpand: true,
                                        label: label,
                                    }),
                                });
                            });
                    }, "microphone-changed");
                },
            }),
        }),
    ],
});
