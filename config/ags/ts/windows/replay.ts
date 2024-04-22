import Gtk from "gi://Gtk?version=3.0";
import WindowHandler from "../window.js";
import * as Widget from "resource:///com/github/Aylur/ags/widget.js";
import * as Utils from "resource:///com/github/Aylur/ags/utils.js";

import Recorder from "../services/recorder.js";

interface MenuButtonProps {
    label: string;
    class_name: string;
    children: Gtk.Widget
}

const MenuButton = ({ label, class_name, children }: MenuButtonProps) => Widget.EventBox({
    class_name: class_name,
    child: Widget.Box({
        hpack: "start",
        spacing: 15,
        children: [
            ...children,
            Widget.Label({
                class_name: "transition-text",
                label: label,
            }),
        ],
    }),
});

const ReplayButton = () => MenuButton({
    label: "Replay",
    class_name: "replay",
    children: [
        Widget.Button({
            setup: widget => widget.hook(Recorder, widget => {
                Recorder.is_replay_paused
                    ? widget.get_style_context().add_class("paused")
                    : widget.get_style_context().remove_class("paused");
            }, "notify::is-replay-paused"),
            child: Widget.Icon("system-reboot-symbolic"),
            on_primary_click: () => {
                Recorder.replay();
                Utils.notify("Replay Recorded!");
            },
        }),
    ],
});

const RecordButton = () => {
    const RecordPlayPause = Widget.Revealer({
        transition: "slide_right",
        transition_duration: 200,
        reveal_child: Recorder.bind("is_recording"),
        child: Widget.Button({
            setup: widget => widget.hook(Recorder, widget => {
                Recorder.is_paused
                    ? widget.get_style_context().add_class("paused")
                    : widget.get_style_context().remove_class("paused");
            }, "notify::is-paused"),
            child: Widget.Icon("media-playback-play-pause-symbolic"),
            on_primary_click: () => Recorder.record_playpause(),
        }),
    });

    const RecordToggle = Widget.Button({
        setup: widget => widget.hook(Recorder, widget => {
            Recorder.is_recording
                ? widget.get_style_context().add_class("recording")
                : widget.get_style_context().remove_class("recording");
        }, "notify::is-recording"),
        child: Widget.Icon({
            icon: Recorder.bind("is_recording").transform(is_recording => {
                return is_recording
                    ? "media-playback-stop-symbolic"
                    : "media-record-symbolic";
            }),
        }),
        on_primary_click: () => {
            Recorder.record();
            Recorder.is_recording
                ? Utils.notify("Recording Started!")
                : Utils.notify("Recording Ended!");
        },
    });

    return MenuButton({
        label: "Record",
        class_name: "record",
        children: [
            RecordToggle,
            RecordPlayPause,
        ],
    });
};

const MicButton = () => MenuButton({
    label: "Toggle Mic",
    class_name: "microphone",
    children: [
        Widget.Button({
            setup: widget => widget.hook(Recorder, widget => {
                !Recorder.mic_enabled
                    ? widget.get_style_context().add_class("disabled")
                    : widget.get_style_context().remove_class("disabled");
            }, "notify::mic-enabled"),
            child: Widget.Icon("audio-input-microphone-symbolic"),
            on_primary_click: () => Recorder.mic_enabled = !Recorder.mic_enabled,
        }),
    ],
});

export default () => WindowHandler.new_window({
    class_name: "replay",
    window: {
        anchor: ["left"],
    },
    box: {
        spacing: 20,
        orientation: Gtk.Orientation.VERTICAL,
    },
    children: [
        ReplayButton(),
        RecordButton(),
        MicButton(),
    ],
});
