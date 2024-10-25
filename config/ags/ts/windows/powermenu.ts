import Gtk from "gi://Gtk?version=3.0";
import WindowHandler from "../window.js";
import * as Widget from "resource:///com/github/Aylur/ags/widget.js";
import * as Utils from "resource:///com/github/Aylur/ags/utils.js";

interface PowermenuButtonProps {
    label: string;
    class_name: string;
    icon: string;
    command: string[];
}

const PowermenuButton = ({ label, class_name, icon, command }: PowermenuButtonProps) => Widget.EventBox({
    class_name: class_name,
    child: Widget.Box({
        hpack: "end",
        spacing: 15,
        children: [
            Widget.Label({
                class_name: "transition-text",
                label: label,
            }),
            Widget.Button({
                on_primary_click: () => Utils.execAsync(command),
                child: Widget.Icon(icon),
            }),
        ],
    }),
});

export default () => WindowHandler.new_window({
    class_name: "powermenu",
    window: {
        anchor: ["right"],
    },
    box: {
        spacing: 20,
        orientation: Gtk.Orientation.VERTICAL,
    },
    children: [
        PowermenuButton({
            label: "Shutdown", class_name: "power",
            icon: "system-shutdown-symbolic",
            command: ["systemctl", "poweroff"],
        }),
        PowermenuButton({
            label: "Reboot", class_name: "reboot",
            icon: "system-reboot-symbolic",
            command:  ["systemctl", "reboot"],
        }),
        PowermenuButton({
            label: "Suspend", class_name: "suspend",
            icon: "system-suspend-symbolic",
            command: ["hyprlock"],
        }),
        PowermenuButton({
            label: "Hibernate", class_name: "hibernate",
            icon: "system-hibernate-symbolic",
            command: ["systemctl", "hibernate"],
        }),
    ],
});
