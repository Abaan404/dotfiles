import { App, Astal, Gtk, Gdk } from "astal/gtk4";
import { execAsync } from "astal";

import { MenuList } from "../components/MenuList";

export default function (gdkmonitor: Gdk.Monitor) {
    return (
        <window
            setup={self => self.set_default_size(1, 1)}
            name="powermenu"
            gdkmonitor={gdkmonitor}
            visible={true}
            anchor={Astal.WindowAnchor.RIGHT}
            application={App}>
            <box cssClasses={["powermenu"]}>
                <box
                    cssClasses={["layout-box"]}
                    spacing={20}
                    orientation={Gtk.Orientation.VERTICAL}
                    valign={Gtk.Align.CENTER}>
                    <MenuList
                        cssClasses={["power"]}
                        label="Shutdown"
                        align="right">
                        <button
                            onButtonPressed={() => execAsync(["systemctl", "poweroff"])}>
                            <image
                                pixelSize={40}
                                iconName="system-shutdown-symbolic" />
                        </button>
                    </MenuList>
                    <MenuList
                        cssClasses={["reboot"]}
                        label="Reboot"
                        align="right">
                        <button
                            onButtonPressed={() => execAsync(["systemctl", "reboot"])}>
                            <image
                                pixelSize={40}
                                iconName="system-reboot-symbolic" />
                        </button>
                    </MenuList>
                    <MenuList
                        cssClasses={["suspend"]}
                        label="Suspend"
                        align="right">
                        <button
                            onButtonPressed={() => execAsync(["systemctl", "suspend"])}>
                            <image
                                pixelSize={40}
                                iconName="system-suspend-symbolic" />
                        </button>
                    </MenuList>
                    <MenuList
                        cssClasses={["hibernate"]}
                        label="Hibernate"
                        align="right">
                        <button
                            onButtonPressed={() => execAsync(["systemctl", "hibernate"])}>
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
