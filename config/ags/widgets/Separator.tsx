import GObject from "astal/gobject"
import { Gtk, astalify, type ConstructProps } from "astal/gtk3";

export class Separator extends astalify(Gtk.Separator) {
    static { GObject.registerClass(this); }

    constructor(props: ConstructProps<Separator, Gtk.Separator.ConstructorProps, {}>) {
        super(props as any);
    }
}

