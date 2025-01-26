import GObject from "astal/gobject"
import { Gtk, astalify, type ConstructProps } from "astal/gtk3";

export class ProgressBar extends astalify(Gtk.ProgressBar) {
    static { GObject.registerClass(this); }

    constructor(props: ConstructProps<ProgressBar, Gtk.ProgressBar.ConstructorProps, {}>) {
        super(props as any);
    }
}
