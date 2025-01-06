import { Gdk, Widget } from "astal/gtk3";
import Binding from "astal/binding";

export function BoxedWindow({
    name,
    gdkmonitor,
    layout_box_props = {},
    children,
    ...window_props
}: {
    name: string;
    gdkmonitor: Gdk.Monitor;
    layout_box_props?: Widget.BoxProps;
    children?: JSX.Element[] | Binding<JSX.Element[]>;
    [key: string]: any;
},
) {
    return (
        <window
            name={name}
            {...window_props}>
            <box
                className={name}>
                <box
                    className="layout-box"
                    {...layout_box_props}>
                    {children}
                </box>
            </box>
        </window>
    );
}
