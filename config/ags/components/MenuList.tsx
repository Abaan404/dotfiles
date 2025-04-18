import { Gtk } from "astal/gtk4";

export function MenuList({
    label,
    cssClasses,
    align,
    child,
}: {
    label: string;
    cssClasses: string[];
    align: "left" | "right";
    child?: JSX.Element;
}) {
    const halign = align === "left" ? Gtk.Align.START : Gtk.Align.END;

    return (
        <box cssClasses={cssClasses}>
            <box halign={halign} spacing={35}>
                {align === "left" && child}
                <box halign={halign}>
                    <label cssClasses={["transition-text"]} label={label} xalign={align === "left" ? 0 : 1} hexpand={true} />
                </box>
                {align === "right" && child}
            </box>
        </box>
    );
}
