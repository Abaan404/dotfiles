import { App, Astal, Gtk, Gdk, Widget } from "astal/gtk3";
import { bind, Variable } from "astal";

import WirePlumber from "gi://AstalWp?version=0.1";

import { BoxedWindow } from "../widgets/BoxedWindow";
import { truncate } from "../utils/strings";
import { symbolic_strength } from "../utils/glyphs";

function MediaSlider({ device_name, mute, default_endpoint, endpoints }: { device_name: Variable<string>; mute: Variable<string>; default_endpoint: WirePlumber.Endpoint; endpoints: Variable<WirePlumber.Endpoint[]> }) {
    const reveal_devices = Variable(false);

    return (
        <box
            className="volume-box"
            orientation={Gtk.Orientation.VERTICAL}>
            <box
                spacing={10}>
                <label
                    className="default name"
                    hexpand={true}
                    halign={Gtk.Align.START}
                    label={device_name().as(description => truncate(description, 46))} />
                <button
                    className="mute"
                    onClick={(_, e) => {
                        switch (e.button) {
                            case Astal.MouseButton.PRIMARY:
                                default_endpoint.set_mute(!default_endpoint.get_mute());
                                break;

                            default:
                                break;
                        }
                    }}>
                    <label label={mute()} />
                </button>
                <button
                    className="list"
                    onClick={(_, e) => {
                        switch (e.button) {
                            case Astal.MouseButton.PRIMARY:
                                reveal_devices.set(!reveal_devices.get());
                                break;

                            default:
                                break;
                        }
                    }}>
                    <label label=" " />
                </button>
            </box>
            <revealer
                transitionDuration={500}
                transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
                css="padding-top: 10px"
                // visible={endpoints.length >= 2} // must have atleast one excluding the default endpoint
                revealChild={reveal_devices()}>
                <box
                    orientation={Gtk.Orientation.VERTICAL}
                    spacing={10}
                    halign={Gtk.Align.START}>
                    {endpoints()
                        .as(endpoint2 => endpoint2
                            .filter(endpoint => endpoint.get_id() !== default_endpoint.get_id())
                            .map((endpoint) => {
                                return (
                                    <button
                                        className="name"
                                        onClick={(_, e) => {
                                            switch (e.button) {
                                                case Astal.MouseButton.PRIMARY:
                                                    endpoint.set_is_default(true);
                                                    break;

                                                default:
                                                    break;
                                            }
                                        }}>
                                        <label
                                            halign={Gtk.Align.START}
                                            hexpand={true}
                                            label={bind(endpoint, "description").as(description => `${truncate(description, 46)}`)} />
                                    </button>
                                );
                            }),
                        )}
                </box>
            </revealer>
            <slider
                drawValue={false}
                min={0}
                max={1}
                value={bind(default_endpoint, "volume")}
                onDragged={self => self.set_value(default_endpoint.get_volume())} />
        </box>
    );
}

export default function (gdkmonitor: Gdk.Monitor) {
    const audio = WirePlumber.get_default();
    if (!audio) {
        return (
            <BoxedWindow
                name="media"
                gdkmonitor={gdkmonitor}
                anchor={Astal.WindowAnchor.TOP
                | Astal.WindowAnchor.RIGHT}
                application={App}
                layout_box_props={{
                    spacing: 10,
                    orientation: Gtk.Orientation.VERTICAL,
                }}>
                <label label="Could not connect to WirePlumber" />
            </BoxedWindow>
        ) as Widget.Window;
    }

    const speaker_label = Variable.derive(
        [bind(audio.default_speaker, "icon"), bind(audio.default_speaker, "description"), bind(audio.default_speaker, "volume")],
        (icon, description, volume) => {
            if (icon.includes("headset")) {
                return `  ${description}`;
            }
            else {
                return `${symbolic_strength(volume, ["󰖀 ", "󰕾 "], 1)} ${description}`;
            }
        },
    );

    const microphone_label = Variable.derive(
        [bind(audio.default_microphone, "description")],
        description => `  ${description}`,
    );

    const microphone_mute = Variable.derive(
        [bind(audio.default_microphone, "mute")],
        mute => mute ? " " : " ",
    );

    const speaker_mute = Variable.derive(
        [bind(audio.default_speaker, "mute")],
        mute => mute ? "󰝟 " : "󰕾 ",
    );

    const speaker_endpoints = Variable.derive(
        [bind(audio, "endpoints"), bind(audio.default_speaker, "id")],
        (endpoints, _) => (endpoints.filter(endpoint => endpoint.get_media_class() === WirePlumber.MediaClass.AUDIO_SPEAKER)),
    );

    const microphone_endpoints = Variable.derive(
        [bind(audio, "endpoints"), bind(audio.default_microphone, "id")],
        (endpoints, _) => (endpoints.filter(endpoint => endpoint.get_media_class() === WirePlumber.MediaClass.AUDIO_MICROPHONE)),
    );

    // bind(audio, "default_microphone").subscribe(console.log);

    return (
        <BoxedWindow
            name="media"
            gdkmonitor={gdkmonitor}
            anchor={Astal.WindowAnchor.TOP
            | Astal.WindowAnchor.RIGHT}
            application={App}
            layout_box_props={{
                spacing: 10,
                orientation: Gtk.Orientation.VERTICAL,
            }}>
            <MediaSlider
                device_name={speaker_label}
                mute={speaker_mute}
                // since the endpoint's properties are getting updated rather than the object, this works just fine
                default_endpoint={audio.default_speaker}
                endpoints={speaker_endpoints} />
            <MediaSlider
                device_name={microphone_label}
                mute={microphone_mute}
                // since the endpoint's properties are getting updated rather than the object, this works just fine
                default_endpoint={audio.default_microphone}
                endpoints={microphone_endpoints} />
        </BoxedWindow>
    ) as Widget.Window;
}
