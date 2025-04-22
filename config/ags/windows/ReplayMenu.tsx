import { App, Gtk, Gdk, Astal } from "astal/gtk4";
import { bind } from "astal";

import Recorder from "../services/recorder";

import { MenuList } from "../components/MenuList";

function ReplayButton() {
    const recorder = Recorder.get_default();

    return (
        <MenuList
            cssClasses={["replay"]}
            label="Replay"
            align="left">
            <button
                cssClasses={bind(recorder, "is_replaying").as(is_replaying => is_replaying ? [] : ["disabled"])}
                hexpand={true}
                onButtonPressed={(_, e) => {
                    switch (e.get_button()) {
                        case Gdk.BUTTON_PRIMARY:
                            recorder.replay();
                            break;

                        default:
                            break;
                    }
                }}>

                <image
                    pixelSize={40}
                    iconName="system-reboot-symbolic" />
            </button>
        </MenuList>
    );
}

function RecordButton() {
    const recorder = Recorder.get_default();

    return (
        <MenuList
            cssClasses={["record"]}
            label="Record"
            align="left">
            <box>
                <button
                    cssClasses={bind(recorder, "is_recording").as(is_recording => is_recording ? ["recording"] : [])}
                    hexpand={true}
                    onButtonPressed={(_, e) => {
                        switch (e.get_button()) {
                            case Gdk.BUTTON_PRIMARY:
                                recorder.record(!recorder.is_recording);
                                break;

                            default:
                                break;
                        }
                    }}>

                    <image
                        pixelSize={40}
                        iconName={bind(recorder, "is_recording").as(is_recording => is_recording ? "media-playback-stop-symbolic" : "media-record-symbolic")} />
                </button>
                <revealer
                    transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
                    transitionDuration={200}
                    revealChild={bind(recorder, "is_recording")}>
                    <button
                        cssClasses={bind(recorder, "is_paused").as(is_paused => is_paused ? ["paused", "pause"] : ["pause"])}
                        onButtonPressed={(_, e) => {
                            switch (e.get_button()) {
                                case Gdk.BUTTON_PRIMARY:
                                    recorder.is_paused = !recorder.is_paused;
                                    break;

                                default:
                                    break;
                            }
                        }}>

                        <image
                            pixelSize={40}
                            iconName="media-playback-play-pause-symbolic" />
                    </button>
                </revealer>
            </box>
        </MenuList>
    );
}

function MicButton() {
    const recorder = Recorder.get_default();

    return (
        <MenuList
            cssClasses={["microphone"]}
            label="Toggle Mic"
            align="left">
            <button
                cssClasses={bind(recorder, "is_mic_enabled").as(is_mic_enabled => is_mic_enabled ? [] : ["disabled"])}
                hexpand={true}
                onButtonPressed={(_, e) => {
                    switch (e.get_button()) {
                        case Gdk.BUTTON_PRIMARY:
                            recorder.is_mic_enabled = !recorder.is_mic_enabled;
                            break;

                        default:
                            break;
                    }
                }}>

                <image
                    pixelSize={40}
                    iconName="audio-input-microphone-symbolic" />
            </button>
        </MenuList>
    );
}

export default function (gdkmonitor: Gdk.Monitor) {
    return (
        <window
            setup={self => self.set_default_size(1, 1)}
            name="replaymenu"
            gdkmonitor={gdkmonitor}
            visible={true}
            anchor={Astal.WindowAnchor.LEFT}
            application={App}>
            <box cssClasses={["replaymenu"]}>
                <box
                    cssClasses={["layout-box"]}
                    spacing={20}
                    orientation={Gtk.Orientation.VERTICAL}
                    valign={Gtk.Align.CENTER}>
                    <ReplayButton />
                    <RecordButton />
                    <MicButton />
                </box>
            </box>
        </window>
    ) as Astal.Window;
}
