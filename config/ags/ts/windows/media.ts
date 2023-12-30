import Gtk from 'gi://Gtk?version=3.0';
import { Widget } from "resource:///com/github/Aylur/ags/widget.js";

// services
import Audio from "resource:///com/github/Aylur/ags/service/audio.js";

// utils
import { execAsync } from "resource:///com/github/Aylur/ags/utils.js";
import { commands } from "../utils.js";
import { new_window } from '../window.js';

// types
import { SliderProps } from 'types/widgets/slider.js';
import { LabelProps } from 'types/widgets/label.js';
import { ButtonProps } from 'types/widgets/button.js';

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
    })

    return Widget.Box({
        class_name: "volume-box",
        vertical: true,
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
                        ...mute
                    }),
                    Widget.Button({
                        class_name: "list",
                        on_primary_click: () => device_revealer.reveal_child = !(device_revealer.reveal_child),
                        child: Widget.Label(" ")
                    })
                ]
            }),
            device_revealer,
            Widget.Slider({
                drawValue: false,
                min: 0,
                max: 100,
                ...slider
            })
        ]
    })

}

export default () => new_window({
    class_name: "media",
    window: {
        anchor: ["top", "right"],
        // popup: false,
    },
    box: {
        spacing: 10,
        vertical: true,
    },
    children: [
        MediaSlider({
            label: {
                setup: widget => {
                    widget.hook(Audio, widget => {
                        widget.label =
                            // FIXME headphone-output does not get detected
                            (Audio.speaker?.stream.port === "headphone-output" ? "  " : "  ") +
                            (Audio.speaker?.description || "Invalid Device");

                        // truncate string if too long
                        if (widget.label.length >= 35)
                            widget.label = `${widget.label.slice(0, 35)}...`;
                    }, "speaker-changed")
                }
            },
            mute: {
                on_primary_click: () => execAsync(commands.sink.mute),
                setup: widget => {
                    widget.hook(Audio, widget => {
                        Audio.speaker?.stream.isMuted
                            ? widget.label = "󰖁 "
                            : widget.label = "󰕾 ";
                    }, "speaker-changed");
                },
            },
            slider: {
                setup: widget => {
                    widget.hook(Audio, widget => {
                        if (!Audio.speaker)
                            return;
                        widget.value = Audio.speaker.volume * 100;
                    }, "speaker-changed")
                },
                on_change: ({ value }) => {
                    if (!Audio.speaker)
                        return;

                    Audio.speaker.volume = value / 100;
                },
            },
            other_devices: Widget.Box({
                setup: widget => {
                    widget.hook(Audio, widget => {
                        widget.children = Audio.speakers
                            .slice(1)
                            .map(speaker => {
                                // FIXME headphone-output does not get detected
                                let label = (speaker.stream.port === "headphone-output" ? "  " : "  ") + speaker.description;

                                // truncate string if too long
                                if (label.length >= 40)
                                    label = `${label.slice(0, 35)}...`;

                                const button = Widget.Button({
                                    class_name: "name",
                                    on_primary_click: () => execAsync(`pactl set-default-source ${speaker.name}`),
                                    child: Widget.Label({
                                        hpack: "start",
                                        hexpand: true,
                                        label: label
                                    })
                                })

                                return button;
                            })
                    })
                }
            })
        }),
        MediaSlider({
            label: {
                setup: widget => {
                    widget.hook(Audio, widget => {
                        widget.label = "  " + (Audio.microphone?.description || "Invalid Device");

                        // truncate string if too long
                        if (widget.label.length >= 35)
                            widget.label = `${widget.label.slice(0, 35)}...`;
                    })
                }
            },
            mute: {
                on_primary_click: () => execAsync(commands.source.mute),
                child: Widget.Label({
                    connections: [[Audio, widget => {
                        Audio.microphone?.stream.isMuted
                            ? widget.label = " "
                            : widget.label = " "
                    }]]
                })
            },
            slider: {
                setup: widget => {
                    widget.hook(Audio, widget => {
                        if (!Audio.microphone)
                            return;
                        widget.value = Audio.microphone.volume * 100;
                    })
                },
                on_change: ({ value }) => {
                    if (!Audio.microphone)
                        return;
                    Audio.microphone.volume = value / 100;
                },
            },
            other_devices: Widget.Box({
                connections: [[Audio, widget =>
                    widget.children = Audio.microphones
                        .slice(1)
                        .map(microphone => {
                            let label = "  " + microphone.description;

                            // truncate string if too long
                            if (label.length >= 40)
                                label = label.slice(0, 35) + "..."

                            const button = Widget.Button({
                                class_name: "name",
                                on_primary_click: () => execAsync(`pactl set-default-source ${microphone.name}`),
                                child: Widget.Label({
                                    hpack: "start",
                                    hexpand: true,
                                    label: label
                                })
                            })

                            return button;
                        })
                ]]
            })
        })
    ]
})
