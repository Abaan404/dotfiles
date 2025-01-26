import { Gtk } from "astal/gtk3";
import { Binding } from "astal/binding";

export function MenuList({
    label,
    class_name,
    align,
    children,
    child,
}: {
    label: string;
    class_name: string;
    align: "left" | "right";
    child?: JSX.Element;
    children?: JSX.Element[] | Binding<JSX.Element[]>;
}) {
    const halign = align === "left" ? Gtk.Align.START : Gtk.Align.END;

    return (
        <eventbox className={class_name}>
            <box halign={halign} spacing={15}>
                {align === "left" && (
                    <>
                        {children}
                        {child}
                    </>
                )}
                <box halign={halign} hexpand={false}>
                    <label className="transition-text" label={label} />
                </box>
                {align === "right" && (
                    <>
                        {children}
                        {child}
                    </>
                )}
            </box>
        </eventbox>
    );
}
