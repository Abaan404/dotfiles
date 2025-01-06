import { App, Astal, Gtk, Gdk, Widget } from "astal/gtk3";

import { BoxedWindow } from "../widgets/BoxedWindow";

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

export default function (gdkmonitor: Gdk.Monitor) {
    return (
        <BoxedWindow
            name="powermenu"
            gdkmonitor={gdkmonitor}
            anchor={Astal.WindowAnchor.RIGHT}
            application={App}
            layout_box_props={{
                spacing: 20,
                orientation: Gtk.Orientation.VERTICAL,
            }}>
            <MenuButton
                class_name="power"
                label="Shutdown"
                icon="system-shutdown-symbolic"
                command={["systemctl", "poweroff"]} />
            <MenuButton
                class_name="reboot"
                label="Reboot"
                icon="system-reboot-symbolic"
                command={["systemctl", "reboot"]} />
            <MenuButton
                class_name="suspend"
                label="Suspend"
                icon="system-suspend-symbolic"
                command={["hyprlock"]} />
            <MenuButton
                class_name="hibernate"
                label="Hibernate"
                icon="system-hibernate-symbolic"
                command={["systemctl", "hibernate"]} />
        </BoxedWindow>
    ) as Widget.Window;
}
