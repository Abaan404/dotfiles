import { App, Gtk, Gdk, Widget } from "astal/gtk3";

export class WindowHandler {
    private registry = new Map<string, (gdkmonitor: Gdk.Monitor) => Widget.Window>();

    private get_window_factory(name: string) {
        const window_factory = this.registry.get(name);
        if (!window_factory) {
            throw Error(`Could not find window "${name}"`);
        }

        return window_factory;
    }

    private has_window(name: string) {
        return App.get_windows().some(window => window.name == name);
    }

    toggle_window(name: string, gdkmonitor: Gdk.Monitor) {
        if (this.has_window(name)) {
            const window = App.get_window(name)!;
            App.remove_window(window);
            window.destroy();

            return;
        }

        const window_factory = this.get_window_factory(name);
        if (window_factory) {
            const window = window_factory(gdkmonitor)
            App.add_window(window);

            return;
        }
    }

    register_window(name: string, window_factory: (gdkmonitor: Gdk.Monitor) => Widget.Window) {
        this.registry.set(name, window_factory);
    }

    static new_window({ name, gdkmonitor, children, box_props, window_props }: { name: string; gdkmonitor: Gdk.Monitor; children: Gtk.Widget[]; box_props: Widget.BoxProps; window_props: Widget.WindowProps }) {
        return <window
            name={name}
            gdkmonitor={gdkmonitor}
            {...window_props}>
            <box className={name}>
                <box
                    className="layout-box"
                    {...box_props}>
                    {children}
                </box>
            </box>
        </window> as Widget.Window;
    }
}

const window_handler = new WindowHandler();
export default window_handler;
