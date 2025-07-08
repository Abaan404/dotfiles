import GObject from "ags/gobject";
import { FCProps } from "ags";
import { Gtk } from "ags/gtk4";

type MenuListProps = FCProps<
    Gtk.Box,
    {
        label: string;
        class: string;
        align: "left" | "right";
        children: GObject.Object;
    }
>;

export function MenuList({
    label,
    class: className,
    align,
    children,
}: MenuListProps) {
    const halign = align === "left" ? Gtk.Align.START : Gtk.Align.END;

    return (
        <box class={className}>
            <box halign={halign} spacing={35}>
                {align === "left" && children}
                <box halign={halign}>
                    <label class="transition-text" label={label} xalign={align === "left" ? 0 : 1} hexpand={true} />
                </box>
                {align === "right" && children}
            </box>
        </box>
    );
}
