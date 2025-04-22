import { App, Astal, Gtk, Gdk } from "astal/gtk4";
import { bind, Variable } from "astal";

import AstalWp from "gi://AstalWp";

import { truncate, symbolic_strength } from "../utils/helpers";

function EndpointSlider({ name, mute, current_endpoint, endpoints }: { name: Variable<string>; mute: Variable<string>; current_endpoint: AstalWp.Endpoint; endpoints?: Variable<AstalWp.Endpoint[]> }) {
    const reveal_devices = Variable(false);

    return (
        <box
            onDestroy={() => {
                name.drop();
                mute.drop();
                endpoints?.drop();
            }}
            cssClasses={["volume-box"]}
            orientation={Gtk.Orientation.VERTICAL}>
            <box
                spacing={10}>
                <label
                    cssClasses={["default", "name"]}
                    hexpand={true}
                    halign={Gtk.Align.START}
                    label={name().as(description => truncate(description, 46))} />
                <button
                    cssClasses={["mute"]}
                    onButtonPressed={(_, e) => {
                        switch (e.get_button()) {
                            case Gdk.BUTTON_PRIMARY:
                                current_endpoint.set_mute(!current_endpoint.get_mute());
                                break;

                            default:
                                break;
                        }
                    }}>
                    <label label={mute()} />
                </button>
                {endpoints && (
                    <button
                        cssClasses={["list"]}
                        onButtonPressed={(_, e) => {
                            switch (e.get_button()) {
                                case Gdk.BUTTON_PRIMARY:
                                    reveal_devices.set(!reveal_devices.get());
                                    break;

                                default:
                                    break;
                            }
                        }}>
                        <label label=" " />
                    </button>
                )}
            </box>
            {endpoints && endpoints().as(endpoints => (
                <revealer
                    transitionDuration={500}
                    transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
                    visible={endpoints.length > 1} // must have more than one endpoints
                    revealChild={reveal_devices()}>
                    <box
                        cssClasses={["available-endpoints"]}
                        orientation={Gtk.Orientation.VERTICAL}
                        spacing={10}
                        halign={Gtk.Align.START}>
                        {endpoints
                            .filter(endpoint => endpoint.get_id() !== current_endpoint.get_id())
                            .map((endpoint) => {
                                return (
                                    <button
                                        cssClasses={["name"]}
                                        onButtonPressed={(_, e) => {
                                            switch (e.get_button()) {
                                                case Gdk.BUTTON_PRIMARY:
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
                            })}
                    </box>
                </revealer>
            ))}
            <slider
                drawValue={false}
                min={0}
                max={1}
                value={bind(current_endpoint, "volume")}
                onChangeValue={self => current_endpoint.set_volume(self.get_value())} />
        </box>
    );
}

export default function (gdkmonitor: Gdk.Monitor) {
    const audio = AstalWp.get_default();

    if (!audio) {
        return (
            <window
                setup={self => self.set_default_size(-1, -1)}
                name="media"
                cssClasses={["media"]}
                gdkmonitor={gdkmonitor}
                visible={true}
                anchor={Astal.WindowAnchor.TOP
                    | Astal.WindowAnchor.RIGHT}
                application={App}>
                <box
                    cssClasses={["layout-box"]}
                    spacing={10}
                    orientation={Gtk.Orientation.VERTICAL}>
                    <label label="Could not connect to WirePlumber" />
                </box>
            </window>
        ) as Astal.Window;
    }

    const speaker = audio.get_default_speaker();
    const microphone = audio.get_default_microphone();
    const endpoints = Variable<AstalWp.Endpoint[]>(audio.get_endpoints() || []);

    audio.connect("endpoint-added", () => endpoints.set(audio.get_endpoints() || []));
    audio.connect("endpoint-removed", () => endpoints.set(audio.get_endpoints() || []));

    let speaker_widget = <></>;
    let microphone_widget = <></>;

    if (speaker) {
        const label = Variable.derive(
            [bind(speaker, "icon"), bind(speaker, "description"), bind(speaker, "volume")],
            (icon, description, volume) => {
                if (icon.includes("headset")) {
                    return `  ${description}`;
                }
                else {
                    return `${symbolic_strength(volume, ["󰖀 ", "󰕾 "], 1)} ${description}`;
                }
            },
        );

        const mute = Variable.derive(
            [bind(speaker, "mute")],
            mute => mute ? "󰝟 " : "󰕾 ",
        );

        const speakers = Variable.derive(
            [endpoints(), bind(speaker, "id")],
            (endpoints, _) => (endpoints.filter(endpoint => endpoint.get_media_class() === AstalWp.MediaClass.AUDIO_SPEAKER)),
        );

        speaker_widget = (
            <EndpointSlider
                name={label}
                mute={mute}
                current_endpoint={speaker}
                endpoints={speakers} />
        );
    }

    if (microphone) {
        const label = Variable.derive(
            [bind(microphone, "description")],
            description => `  ${description}`,
        );

        const mute = Variable.derive(
            [bind(microphone, "mute")],
            mute => mute ? " " : " ",
        );

        const microphones = Variable.derive(
            [endpoints(), bind(microphone, "id")],
            (endpoints, _) => (endpoints.filter(endpoint => endpoint.get_media_class() === AstalWp.MediaClass.AUDIO_MICROPHONE)),
        );

        microphone_widget = (
            <EndpointSlider
                name={label}
                mute={mute}
                current_endpoint={microphone}
                endpoints={microphones} />
        );
    }

    function get_stream_widgets(endpoints: AstalWp.Endpoint[]) {
        return endpoints
            .filter(endpoint => endpoint.get_media_class() === AstalWp.MediaClass.AUDIO_STREAM)
            .map((stream) => {
                const label = Variable.derive(
                    [bind(stream, "description"), bind(stream, "name")],
                    (description, name) => `󰕾  ${description}: ${name}`,
                );

                const mute = Variable.derive(
                    [bind(stream, "mute")],
                    mute => mute ? "󰝟 " : "󰕾 ",
                );

                return (
                    <EndpointSlider
                        name={label}
                        mute={mute}
                        current_endpoint={stream} />
                );
            });
    }

    const stream_widgets = Variable<Gtk.Widget[]>(get_stream_widgets(endpoints.get()));
    const reveal = Variable(false);

    endpoints.subscribe(endpoints => stream_widgets.set(get_stream_widgets(endpoints)));

    return (
        <window
            setup={self => self.set_default_size(1, 1)}
            name="media"
            cssClasses={["media"]}
            gdkmonitor={gdkmonitor}
            visible={true}
            anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
            application={App}>
            <box
                cssClasses={["layout-box"]}
                spacing={10}
                orientation={Gtk.Orientation.VERTICAL}>
                {speaker && speaker_widget}
                {microphone && microphone_widget}
                <box
                    orientation={Gtk.Orientation.VERTICAL}
                    cssClasses={["mixer"]}>
                    <button
                        cssClasses={["show"]}
                        onButtonPressed={(_, e) => {
                            switch (e.get_button()) {
                                case Gdk.BUTTON_PRIMARY:
                                    reveal.set(!reveal.get());
                                    break;

                                default:
                                    break;
                            }
                        }}>
                        <label label="Applications" />
                    </button>
                    <revealer
                        transitionDuration={500}
                        transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
                        revealChild={reveal()}>
                        <box
                            cssClasses={["streams"]}
                            spacing={10}
                            orientation={Gtk.Orientation.VERTICAL}>
                            {stream_widgets()}
                        </box>
                    </revealer>
                </box>
            </box>
        </window>
    ) as Astal.Window;
}
