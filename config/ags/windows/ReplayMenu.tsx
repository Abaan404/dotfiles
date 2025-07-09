import App from "ags/gtk4/app";
import { Gtk, Gdk, Astal } from "ags/gtk4";
import { createBinding } from "ags";

import Recorder from "../services/recorder";

import { MenuList } from "../components/MenuList";

function ReplayButton() {
    const recorder = Recorder.get_default();

    return (
        <MenuList
            class="replay"
            label="Replay"
            align="left">
            <button
                class={createBinding(recorder, "is_replaying").as(is_replaying => is_replaying ? "" : "disabled")}
                hexpand={true}
                onClicked={() => recorder.replay()}>

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
            class="record"
            label="Record"
            align="left">
            <box>
                <button
                    class={createBinding(recorder, "is_recording").as(is_recording => is_recording ? "recording" : "")}
                    hexpand={true}
                    onClicked={() => recorder.record(!recorder.is_recording)}>

                    <image
                        pixelSize={40}
                        iconName={createBinding(recorder, "is_recording").as(is_recording => is_recording ? "media-playback-stop-symbolic" : "media-record-symbolic")} />
                </button>
                <revealer
                    transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
                    transitionDuration={200}
                    revealChild={createBinding(recorder, "is_recording")}>
                    <button
                        class={createBinding(recorder, "is_paused").as(is_paused => is_paused ? "paused pause" : "pause")}
                        onClicked={() => recorder.is_paused = !recorder.is_paused}>

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
            class="microphone"
            label="Toggle Mic"
            align="left">
            <button
                class={createBinding(recorder, "is_mic_enabled").as(is_mic_enabled => is_mic_enabled ? "" : "disabled")}
                hexpand={true}
                onClicked={() => recorder.is_mic_enabled = !recorder.is_mic_enabled}>

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
            $={self => self.set_default_size(1, 1)}
            name="replaymenu"
            gdkmonitor={gdkmonitor}
            visible={true}
            anchor={Astal.WindowAnchor.LEFT}
            application={App}>
            <box class="replaymenu">
                <box
                    class="layout-box"
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
