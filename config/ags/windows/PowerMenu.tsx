import { App, Astal, Gtk, Gdk, Widget } from "astal/gtk3";

import { BoxedWindow } from "../widgets/BoxedWindow";
import { MenuList } from "../widgets/MenuList";

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
            <MenuList
                class_name="power"
                label="Shutdown"
                align="right">
                <button
                    onClick={["systemctl", "poweroff"]}>
                    <icon icon="system-shutdown-symbolic" />
                </button>
            </MenuList>
            <MenuList
                class_name="reboot"
                label="Reboot"
                align="right">
                <button
                    onClick={["systemctl", "reboot"]}>
                    <icon icon="system-reboot-symbolic" />
                </button>
            </MenuList>
            <MenuList
                class_name="suspend"
                label="Suspend"
                align="right">
                <button
                    onClick={["systemctl", "suspend"]}>
                    <icon icon="system-suspend-symbolic" />
                </button>
            </MenuList>
            <MenuList
                class_name="hibernate"
                label="Hibernate"
                align="right">
                <button
                    onClick={["systemctl", "hibernate"]}>
                    <icon icon="system-hibernate-symbolic" />
                </button>
            </MenuList>
        </BoxedWindow>
    ) as Widget.Window;
}
