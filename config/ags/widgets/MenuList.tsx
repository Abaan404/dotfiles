import { Gtk } from "astal/gtk3";
import { Binding } from "astal/binding";

export function MenuList({ label, class_name, align, children, child }: {
    label: string;
    class_name: string;
    align: Gtk.Align;
    child?: JSX.Element;
    children?: JSX.Element[] | Binding<JSX.Element[]>;
}) {
    return (
        <eventbox
            className={class_name}>
            <box
                halign={align}
                spacing={15}>
                {children}
                {child}
                <box
                    halign={align}
                    hexpand={false}>
                    <label className="transition-text" label={label} />
                </box>
            </box>
        </eventbox>
    );
}
