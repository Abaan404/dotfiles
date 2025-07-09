import { Gtk } from "ags/gtk4";
import { createBinding, createState, Accessor, FCProps, For } from "ags";

import AstalWp from "gi://AstalWp";

import { truncate } from "../utils/helpers";

type EndpointSliderProps = FCProps<
    Gtk.Box,
    {
        name: Accessor<string>;
        mute: Accessor<string>;
        current_endpoint: AstalWp.Endpoint;
        endpoints: Accessor<AstalWp.Endpoint[]>;
    }
>;

export function EndpointSlider({ name, mute, current_endpoint, endpoints }: EndpointSliderProps) {
    const [reveal_devices, set_reveal_devices] = createState(false);

    return (
        <box
            class="endpoint-slider"
            orientation={Gtk.Orientation.VERTICAL}>
            <box
                spacing={10}>
                <label
                    class="default name"
                    hexpand={true}
                    halign={Gtk.Align.START}
                    label={name(description => truncate(description, 46))} />
                <button
                    class="mute"
                    onClicked={() => current_endpoint.set_mute(!current_endpoint.get_mute())}>
                    <label label={mute} />
                </button>
                <button
                    class="list"
                    onClicked={() => set_reveal_devices(!reveal_devices.get())}>
                    <label label=" " />
                </button>
            </box>
            <revealer
                transitionDuration={500}
                transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
                revealChild={reveal_devices}>
                <box
                    class="available"
                    orientation={Gtk.Orientation.VERTICAL}
                    spacing={10}
                    halign={Gtk.Align.START}>
                    <For each={endpoints(endpoints => endpoints.filter(endpoint => endpoint.get_id() !== current_endpoint.get_id()))}>
                        {(endpoint: AstalWp.Endpoint) => (
                            <button
                                onClicked={() => endpoint.set_is_default(true)}>
                                <label
                                    class="name"
                                    halign={Gtk.Align.START}
                                    hexpand={true}
                                    label={createBinding(endpoint, "description").as(description => `${truncate(description, 46)}`)} />
                            </button>
                        )}
                    </For>
                </box>
            </revealer>
            <slider
                drawValue={false}
                min={0}
                max={1}
                value={createBinding(current_endpoint, "volume")}
                onChangeValue={self => current_endpoint.set_volume(self.get_value())} />
        </box>
    );
}
