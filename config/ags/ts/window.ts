// just a bunch of functions for managing AgsWindow

// core
import App from "resource:///com/github/Aylur/ags/app.js";
import Widget from "resource:///com/github/Aylur/ags/widget.js";
import Gtk from "gi://Gtk";

// widgets
import Bar from "./windows/bar.js"
import Powermenu from "./windows/powermenu.js"
import Media from "./windows/media.js"

// types
import AgsWindow from "resource:///com/github/Aylur/ags/widgets/window.js";
import { BoxProps } from "types/widgets/box.js";
import { WindowProps } from "types/widgets/window.js";

const registry: Map<string, () => AgsWindow> = new Map();
registry.set("bar", Bar);
registry.set("powermenu", Powermenu);
registry.set("media", Media);

export function spawn_window(name: string): AgsWindow | undefined {
    const window_factory = registry.get(name);
    if (!window_factory) {
        logError("Could not find a window " + name);
        return;
    }

    if (App.windows.has(name)) {
        logError("window already exists " + name);
        return;
    }

    return window_factory();
}

export function toggle_window(name: string) {
    const window_factory = registry.get(name);
    if (!window_factory) {
        return
    }

    if (App.windows.has(name)) {
        App.removeWindow(name);
    } else {
        App.addWindow(window_factory())
    }
}

interface WindowCreateProps {
    class_name: string;
    children: Gtk.Widget[];
    box: BoxProps;
    window: WindowProps;
}

export function new_window({ class_name, children, box, window }: WindowCreateProps) {
    return Widget.Window({
        name: class_name,
        popup: true,
        ...window,
        child: Widget.Box({
            class_name: class_name,
            children: [
                Widget.Box({
                    class_name: "layout-box",
                    children: children,
                    ...box,
                })
            ]
        }),
    });
}
