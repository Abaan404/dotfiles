import Gtk from "gi://Gtk";
import App from "resource:///com/github/Aylur/ags/app.js";
import * as Widget from "resource:///com/github/Aylur/ags/widget.js";

import Bar from "./windows/bar.js";
import Powermenu from "./windows/powermenu.js";
import Media from "./windows/media.js";
import Player from "./windows/player.js";
import Glance from "./windows/glance.js";

import AgsWindow from "resource:///com/github/Aylur/ags/widgets/window.js";
import { BoxProps } from "types/widgets/box.js";
import { WindowProps } from "types/widgets/window.js";

interface WindowCreateProps {
    class_name: string;
    children: Gtk.Widget[];
    box: BoxProps;
    window: WindowProps;
}

class WindowHandler {
    private registry: Map<string, () => AgsWindow<any, any>> = new Map();

    constructor() {
        this.registry.set("bar", Bar);
        this.registry.set("powermenu", Powermenu);
        this.registry.set("media", Media);
        this.registry.set("player", Player);
        this.registry.set("glance", Glance);
    }

    spawn_window(name: string): AgsWindow<any, any> | undefined {
        const window_factory = this.registry.get(name);
        if (!window_factory) {
            logError("Could not find a window " + name);
            return;
        }

        const window_names = App.windows.map(window => window.name);
        if (window_names.includes(name)) {
            logError("window already exists " + name);
            return;
        }

        return window_factory();
    }

    toggle_window(name: string) {
        const window_factory = this.registry.get(name);
        if (!window_factory)
            return;

        const window_names = App.windows.map(window => window.name);
        if (window_names.includes(name))
            App.removeWindow(name);
        else
            App.addWindow(window_factory());
    }

    new_window({ class_name, children, box, window }: WindowCreateProps) {
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
                    }),
                ],
            }),
        });
    }
}

const window_handler = new WindowHandler;
export default window_handler;
