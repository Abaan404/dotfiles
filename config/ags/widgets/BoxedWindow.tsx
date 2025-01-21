import { Binding } from "astal";
import { Widget } from "astal/gtk3";

export interface BoxedWindowProps extends Widget.WindowProps {
    name: string;
    layout_box_props?: Widget.BoxProps;
    child?: JSX.Element;
    children?: JSX.Element[] | Binding<JSX.Element[]>;
}

export function BoxedWindow(window_props: BoxedWindowProps) {
    const { name, layout_box_props, child, children, ...props } = window_props;

    return (
        <window
            name={name}
            {...props}>
            <box
                className={name}>
                <box
                    className="layout-box"
                    {...layout_box_props}>
                    {child}
                    {children}
                </box>
            </box>
        </window>
    );
}
