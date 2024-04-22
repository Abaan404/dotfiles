import Gtk from "gi://Gtk?version=3.0";
import WindowHandler from "../window.js";
import * as Widget from "resource:///com/github/Aylur/ags/widget.js";
import { truncate } from "ts/utils.js";

import Audio from "resource:///com/github/Aylur/ags/service/audio.js";

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

export default () => WindowHandler.new_window({
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
                label: Audio.bind("speaker").transform(speaker => {
                    let label = speaker?.description;

                    switch (speaker.stream?.port) {
                        case "headphone-output":
                        case "analog-output-headphones":
                            label = "  " + label;
                            break;

                        default:
                            label = "  " + label || "Invalid Device";
                            break;
                    }

                    return truncate(label, 38);
                }),
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
                                switch (speaker.stream?.port) {
                                    case "headphone-output":
                                    case "analog-output-headphones":
                                        label = "  " + label;
                                        break;

                                    default:
                                        label = "  " + label;
                                        break;
                                }

                                return Widget.Button({
                                    class_name: "name",
                                    on_primary_click: () => Audio.speaker = speaker,
                                    child: Widget.Label({
                                        hpack: "start",
                                        hexpand: true,
                                        label: truncate(label, 46),
                                    }),
                                });
                            });
                    }, "speaker-changed");
                },
            }),
        }),
        MediaSlider({
            label: {
                label: Audio.bind("microphone").transform(microphone => {
                    const label = "  " + (microphone?.description || "Invalid Device");
                    return truncate(label, 38);
                }),
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
                                const label = "  " + microphone.description;

                                return Widget.Button({
                                    class_name: "name",
                                    on_primary_click: () => Audio.microphone = microphone,
                                    child: Widget.Label({
                                        hpack: "start",
                                        hexpand: true,
                                        label: truncate(label, 46),
                                    }),
                                });
                            });
                    }, "microphone-changed");
                },
            }),
        }),
    ],
});
