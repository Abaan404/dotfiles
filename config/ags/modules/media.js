import Gtk from 'gi://Gtk?version=3.0';
import { commands, create_window } from "../utils.js";

import { Mpris, Audio, Widget } from "../imports.js";

const MediaSlider = ({ label, mute, other_devices, slider }) => Widget.Box({
    className: "volume-box",
    orientation: Gtk.Orientation.VERTICAL,
    children: [
        Widget.Box({
            spacing: 10,
            children: [
                Widget.Label({
                    className: ["default", "name"],
                    hexpand: true,
                    halign: Gtk.Align.START,
                    ...label,
                }),
                Widget.Button({
                    className: "mute",
                    ...mute
                }),
                Widget.Button({
                    className: "list",
                    onPrimaryClick: widget => widget.parent.parent.children[1].reveal_child = !(widget.parent.parent.children[1].reveal_child),
                    child: Widget.Label(" ")
                })
            ]
        }),
        Widget.Revealer({
            transition: "slide_down",
            transitionDuration: 500,
            style: "padding-top: 10px;",
            child: other_devices, 
        }),
        Widget.Slider({
            drawValue: false,
            min: 0,
            max: 100,
            ...slider
        })
    ]
})

export const MediaFactory = () => create_window({
    className: "audio",
    // popup: false,
    anchor: ["top" ,"right"],
    box: {
        spacing: 10,
        orientation: Gtk.Orientation.VERTICAL,
    },
    children: [
        MediaSlider({
            label: {
                connections: [[Audio, widget => {
                    widget.label = (Audio.speaker._stream.port === "headphone-output" ? "  " : "  ") + Audio.speaker.description;

                    // truncate string if too long
                    if (widget.label.length >= 35)
                        widget.label = widget.label.slice(0, 35) + "..."
                }]]
            },
            mute: {
                onPrimaryClick: commands.sink.mute,
                child: Widget.Label({
                    connections: [[Audio, widget => {
                        Audio.speaker.isMuted
                            ? widget.label = "󰖁 "
                            : widget.label = "󰕾 "
                    }]]
                })
            },
            slider: {
                onChange: ({ value }) => Audio.speaker.volume = value / 100,
                connections: [[Audio, widget => {
                    if (!Audio.speaker)
                        return;
                    widget.value = Audio.speaker.volume * 100;
                }]]
            },
            other_devices: Widget.Box({
                connections: [[Audio, widget =>
                    widget.children = Audio.speakers
                        .slice(1)
                        .map(speaker => {
                            const label = (speaker._stream.port === "headphone-output" ? "  " : "  ") + speaker.description;

                            // truncate string if too long
                            if (label.length >= 40)
                                label = label.slice(0, 35) + "..."

                            const button = Widget.Button({
                                className: "name",
                                onPrimaryClick: `pactl set-default-source ${speaker.name}`,
                                child: Widget.Label({
                                    halign: Gtk.Align.START,
                                    hexpand: true,
                                    label: label
                                })
                            })

                            return button;
                        })
                ]]
            })
        }),
        MediaSlider({
            label: {
                connections: [[Audio, widget => {
                    widget.label = "  " + Audio.microphone.description;

                    // truncate string if too long
                    if (widget.label.length >= 35)
                        widget.label = widget.label.slice(0, 35) + "..."
                }]]
            },
            mute: {
                onPrimaryClick: commands.source.mute,
                child: Widget.Label({
                    connections: [[Audio, widget => {
                        log(Audio.microphone.isMuted)
                        Audio.microphone.isMuted
                            ? widget.label = " "
                            : widget.label = " "
                    }]]
                })
            },
            slider: {
                onChange: ({ value }) => Audio.microphone.volume = value / 100,
                connections: [[Audio, widget => {
                    if (!Audio.microphone)
                        return;
                    widget.value = Audio.microphone.volume * 100;
                }]]
            },
            other_devices: Widget.Box({
                connections: [[Audio, widget =>
                    widget.children = Audio.microphones
                        .slice(1)
                        .map(microphone => {
                            const label = "  " + microphone.description;

                            // truncate string if too long
                            if (label.length >= 40)
                                label = label.slice(0, 35) + "..."

                            const button = Widget.Button({
                                className: "name",
                                onPrimaryClick: `pactl set-default-source ${microphone.name}`,
                                child: Widget.Label({
                                    halign: Gtk.Align.START,
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
