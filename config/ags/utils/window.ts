import { createRoot } from "ags";
import { Gtk, Gdk } from "ags/gtk4";

export class WindowHandler {
    private registry = new Map<string, (gdkmonitor: Gdk.Monitor) => Gtk.Window>();
    private windows = new Map<string, () => void>();

    toggle_window(name: string, gdkmonitor: Gdk.Monitor) {
        if (this.windows.has(name)) {
            const dispose = this.windows.get(name)!;
            dispose();
            this.windows.delete(name);
            return;
        }

        const window_factory = this.registry.get(name);
        if (!window_factory) {
            throw Error(`Could not find window "${name}"`);
        }

        createRoot((dispose) => {
            const window = window_factory(gdkmonitor);
            const remove = () => {
                window.destroy();
                dispose();
            };

            this.windows.set(name, remove);
        });
    }

    register_window(name: string, window_factory: (gdkmonitor: Gdk.Monitor) => Gtk.Window) {
        this.registry.set(name, window_factory);
    }
}

const window_handler = new WindowHandler();
export default window_handler;
