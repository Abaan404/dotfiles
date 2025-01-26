import { App, Gtk, Gdk, Widget, Astal } from "astal/gtk3";
import { bind } from "astal";

import { BoxedWindow } from "../widgets/BoxedWindow";
import { MenuList } from "../widgets/MenuList";
import Recorder from "../services/recorder";

function ReplayButton() {
    const recorder = Recorder.get_default();

    return (
        <MenuList
            class_name="replay"
            label="Replay"
            align={Gtk.Align.START}>
            <button
                className={bind(recorder, "is_replaying").as(is_replaying => is_replaying ? "" : "disabled")}
                onClick={(_, e) => {
                    switch (e.button) {
                        case Astal.MouseButton.PRIMARY:
                            recorder.replay();
                            break;

                        default:
                            break;
                    }
                }}>

                <icon
                    icon="system-reboot-symbolic" />
            </button>
        </MenuList>
    );
}

function RecordButton() {
    const recorder = Recorder.get_default();

    return (
        <MenuList
            class_name="record"
            label="Record"
            align={Gtk.Align.START}>
            <button
                className={bind(recorder, "is_recording").as(is_recording => is_recording ? "recording" : "")}
                onClick={(_, e) => {
                    switch (e.button) {
                        case Astal.MouseButton.PRIMARY:
                            recorder.record(!recorder.is_recording);
                            break;

                        default:
                            break;
                    }
                }}>

                <icon
                    icon={bind(recorder, "is_recording").as(is_recording => is_recording ? "media-playback-stop-symbolic" : "media-record-symbolic")} />
            </button>
            <revealer
                transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
                transitionDuration={200}
                revealChild={bind(recorder, "is_recording")}>
                <button
                    className={bind(recorder, "is_paused").as(is_paused => is_paused ? "paused" : "")}
                    onClick={(_, e) => {
                        switch (e.button) {
                            case Astal.MouseButton.PRIMARY:
                                recorder.is_paused = !recorder.is_paused;
                                break;

                            default:
                                break;
                        }
                    }}>

                    <icon icon="media-playback-play-pause-symbolic" />
                </button>
            </revealer>
        </MenuList>
    );
}

function MicButton() {
    const recorder = Recorder.get_default();

    return (
        <MenuList
            class_name="microphone"
            label="Toggle Mic"
            align={Gtk.Align.START}>
            <button
                className={bind(recorder, "is_mic_enabled").as(is_mic_enabled => is_mic_enabled ? "" : "disabled")}
                onClick={(_, e) => {
                    switch (e.button) {
                        case Astal.MouseButton.PRIMARY:
                            recorder.is_mic_enabled = !recorder.is_mic_enabled;
                            break;

                        default:
                            break;
                    }
                }}>

                <icon icon="audio-input-microphone-symbolic" />
            </button>
        </MenuList>
    );
}

export default function (gdkmonitor: Gdk.Monitor) {
    return (
        <BoxedWindow
            name="replay"
            gdkmonitor={gdkmonitor}
            anchor={Astal.WindowAnchor.LEFT}
            application={App}
            layout_box_props={{
                spacing: 20,
                orientation: Gtk.Orientation.VERTICAL,
            }}>
            <ReplayButton />
            <RecordButton />
            <MicButton />
        </BoxedWindow>
    ) as Widget.Window;
}
