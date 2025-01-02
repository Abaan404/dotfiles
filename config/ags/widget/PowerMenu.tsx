import { App, Astal, Gtk, Gdk } from "astal/gtk3";
import { WindowHandler } from "../helpers/window";

function MenuButton({ label, class_name, icon, command }: {
    label: string;
    class_name: string;
    icon: string;
    command: string[];
}) {
    return (
        <eventbox
            className={class_name}>
            <box
                halign={Gtk.Align.END}
                spacing={15}>
                <box
                    halign={Gtk.Align.END}
                    hexpand={false}>
                    <label className="transition-text" label={label} />
                </box>
                <button
                    onClick={command}>
                    <icon icon={icon} />
                </button>
            </box>
        </eventbox>
    );
}

export default function PowerMenu(gdkmonitor: Gdk.Monitor) {
    return WindowHandler.new_window({
        name: "powermenu",
        window_props: {
            gdkmonitor: gdkmonitor,
            anchor: Astal.WindowAnchor.RIGHT,
            application: App,
        },
        box_props: {
            spacing: 20,
            orientation: Gtk.Orientation.VERTICAL,
        },
        children: [
            <MenuButton
                class_name="power"
                label="Shutdown"
                icon="system-shutdown-symbolic"
                command={["systemctl", "poweroff"]} />,
            <MenuButton
                class_name="reboot"
                label="Reboot"
                icon="system-reboot-symbolic"
                command={["systemctl", "reboot"]} />,
            <MenuButton
                class_name="suspend"
                label="Suspend"
                icon="system-suspend-symbolic"
                command={["hyprlock"]} />,
            <MenuButton
                class_name="hibernate"
                label="Hibernate"
                icon="system-hibernate-symbolic"
                command={["systemctl", "hibernate"]} />,
        ],
        gdkmonitor: gdkmonitor,
    });
}
