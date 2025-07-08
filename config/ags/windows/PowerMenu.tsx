import App from "ags/gtk4/app";
import { execAsync } from "ags/process";

import { MenuList } from "../components/MenuList";
import { Astal, Gdk, Gtk } from "ags/gtk4";

export default function (gdkmonitor: Gdk.Monitor) {
    return (
        <window
            $={self => self.set_default_size(1, 1)}
            name="powermenu"
            gdkmonitor={gdkmonitor}
            visible={true}
            anchor={Astal.WindowAnchor.RIGHT}
            application={App}>
            <box class="powermenu">
                <box
                    class="layout-box"
                    spacing={20}
                    orientation={Gtk.Orientation.VERTICAL}
                    valign={Gtk.Align.CENTER}>
                    <MenuList
                        class="power"
                        label="Shutdown"
                        align="right">
                        <button
                            onClicked={() => execAsync(["systemctl", "poweroff"])}>
                            <image
                                pixelSize={40}
                                iconName="system-shutdown-symbolic" />
                        </button>
                    </MenuList>
                    <MenuList
                        class="reboot"
                        label="Reboot"
                        align="right">
                        <button
                            onClicked={() => execAsync(["systemctl", "reboot"])}>
                            <image
                                pixelSize={40}
                                iconName="system-reboot-symbolic" />
                        </button>
                    </MenuList>
                    <MenuList
                        class="suspend"
                        label="Suspend"
                        align="right">
                        <button
                            onClicked={() => execAsync(["systemctl", "suspend"])}>
                            <image
                                pixelSize={40}
                                iconName="system-suspend-symbolic" />
                        </button>
                    </MenuList>
                    <MenuList
                        class="hibernate"
                        label="Hibernate"
                        align="right">
                        <button
                            onClicked={() => execAsync(["systemctl", "hibernate"])}>
                            <image
                                pixelSize={40}
                                iconName="system-hibernate-symbolic" />
                        </button>
                    </MenuList>
                </box>
            </box>
        </window>
    ) as Astal.Window;
}
