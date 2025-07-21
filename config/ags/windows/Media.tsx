import App from "ags/gtk4/app";
import { Astal, Gtk, Gdk } from "ags/gtk4";
import { createBinding, createState, createComputed, Accessor, For, createConnection } from "ags";

import AstalWp from "gi://AstalWp";

import { symbolic_strength } from "../utils/helpers";
import { EndpointSlider } from "../components/EndpointSlider";
import { StreamSlider } from "../components/StreamSlider";

export default function (gdkmonitor: Gdk.Monitor) {
    const audio = AstalWp.get_default()?.get_audio();

    if (!audio) {
        return (
            <window
                $={self => self.set_default_size(-1, -1)}
                name="media"
                class="media"
                gdkmonitor={gdkmonitor}
                visible={true}
                anchor={Astal.WindowAnchor.TOP
                    | Astal.WindowAnchor.RIGHT}
                application={App}>
                <box
                    class="layout-box"
                    spacing={10}
                    orientation={Gtk.Orientation.VERTICAL}>
                    <label label="Could not connect to WirePlumber" />
                </box>
            </window>
        ) as Astal.Window;
    }

    const speaker = audio.get_default_speaker();
    const microphone = audio.get_default_microphone();

    let speaker_widget = <></>;
    let microphone_widget = <></>;
    let stream_widgets = <></>;

    if (speaker) {
        const label = createComputed(
            [createBinding(audio.default_speaker, "icon"), createBinding(audio.default_speaker, "description"), createBinding(audio.default_speaker, "volume")],
            (icon, description, volume) => {
                if (icon.includes("headset")) {
                    return `  ${description}`;
                }
                else {
                    return `${symbolic_strength(volume, ["󰖀 ", "󰕾 "], 1)} ${description}`;
                }
            },
        );

        const mute = createComputed(
            [createBinding(audio.default_speaker, "mute")],
            mute => mute ? "󰝟 " : "󰕾 ",
        );

        const signals_speakers = createConnection(null,
            [audio, "speaker-added", () => null],
            [audio, "speaker-removed", () => null],
        );

        const speakers = createComputed(
            [signals_speakers, createBinding(speaker, "description")],
            () => audio.get_speakers() || [],
        );

        const streams = createConnection(audio.get_streams() || [],
            [audio, "stream-added", () => audio.get_streams() || []],
            [audio, "stream-removed", () => audio.get_streams() || []],
        );

        speaker_widget = (
            <EndpointSlider
                name={label}
                mute={mute}
                current_endpoint={speaker}
                endpoints={speakers} />
        );

        stream_widgets = (
            <For each={streams}>
                {stream => (
                    <StreamSlider
                        stream={stream}
                        endpoints={speakers} />
                )}
            </For>
        );
    }

    if (microphone) {
        const label = createComputed(
            [createBinding(audio.default_microphone, "description")],
            description => `  ${description}`,
        );

        const mute = createComputed(
            [createBinding(audio.default_microphone, "mute")],
            mute => mute ? " " : " ",
        );

        const signals_microphones = createConnection(null,
            [audio, "microphone-added", () => null],
            [audio, "microphone-removed", () => null],
        );

        const microphones = createComputed(
            [signals_microphones, createBinding(microphone, "description")],
            () => audio.get_microphones() || [],
        );

        microphone_widget = (
            <EndpointSlider
                name={label}
                mute={mute}
                current_endpoint={microphone}
                endpoints={microphones} />
        );
    }

    const [reveal, set_reveal] = createState(false);

    return (
        <window
            $={self => self.set_default_size(1, 1)}
            name="media"
            class="media"
            gdkmonitor={gdkmonitor}
            visible={true}
            anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
            application={App}>
            <box
                class="layout-box"
                spacing={10}
                orientation={Gtk.Orientation.VERTICAL}>
                {speaker && speaker_widget}
                {microphone && microphone_widget}
                <box
                    orientation={Gtk.Orientation.VERTICAL}
                    class="mixer">
                    <button
                        class="show"
                        onClicked={() => set_reveal(!reveal.get())}>
                        <label label="Applications" />
                    </button>
                    <revealer
                        transitionDuration={500}
                        transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
                        revealChild={reveal}>
                        <box
                            class="streams"
                            spacing={10}
                            orientation={Gtk.Orientation.VERTICAL}>
                            {stream_widgets}
                        </box>
                    </revealer>
                </box>
            </box>
        </window>
    ) as Astal.Window;
}
