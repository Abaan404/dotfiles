import { Gtk } from "ags/gtk4";
import { createBinding, createState, onCleanup, createComputed, Accessor, FCProps, For, Setter } from "ags";

import AstalWp from "gi://AstalWp";

import { truncate } from "../utils/helpers";

type StreamSliderProps = FCProps<
    Gtk.Box,
    {
        stream: AstalWp.Stream;
        endpoints: Accessor<AstalWp.Endpoint[]>;
        setEndpoints: Setter<AstalWp.Endpoint[]>;
    }
>;

export function StreamSlider({ stream, endpoints, setEndpoints }: StreamSliderProps) {
    const [reveal_targets, set_reveal_targets] = createState(false);

    const dispose = createBinding(stream, "target_endpoint").subscribe(() => setEndpoints([...endpoints.get()]));
    onCleanup(() => dispose());

    const label = createComputed(
        [createBinding(stream, "description"), createBinding(stream, "target_endpoint")],
        (description, target_endpoint) => {
            return target_endpoint
                ? `${description} (${stream.get_target_endpoint()?.get_description()})`
                : description;
        },
    );

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
                    label={label.as(description => truncate(description, 46))} />
                <button
                    class="mute"
                    onClicked={() => stream.set_mute(!stream.get_mute())}>
                    <label label={createBinding(stream, "mute").as(mute => mute ? "󰝟 " : "󰕾 ")} />
                </button>
                <button
                    class="list"
                    onClicked={() => set_reveal_targets(!reveal_targets.get())}>
                    <label label=" " />
                </button>
            </box>
            <revealer
                transitionDuration={500}
                transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
                revealChild={reveal_targets}>
                <box
                    class="available"
                    orientation={Gtk.Orientation.VERTICAL}
                    spacing={10}
                    halign={Gtk.Align.START}>
                    <For each={endpoints(endpoints => endpoints.filter(endpoint => endpoint.get_id() !== stream.get_target_endpoint()?.get_id()))}>
                        {(endpoint: AstalWp.Endpoint) => (
                            <button
                                onClicked={() => stream.set_target_endpoint(endpoint)}>
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
                value={createBinding(stream, "volume")}
                onChangeValue={self => stream.set_volume(self.get_value())} />
        </box>
    );
}
