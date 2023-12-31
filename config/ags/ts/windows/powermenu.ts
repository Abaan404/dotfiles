import Gtk from "gi://Gtk?version=3.0";
import Widget from "resource:///com/github/Aylur/ags/widget.js";

import { commands } from "../utils.js";
import { execAsync } from "resource:///com/github/Aylur/ags/utils.js";
import { new_window } from "../window.js";

interface PowermenuButtonProps {
    label: string;
    class_name: string;
    glyph: string;
    command: string;
}

const PowermenuButton = ({ label, class_name, glyph, command }: PowermenuButtonProps) => Widget.EventBox({
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
                on_primary_click: () => execAsync(command),
                child: Widget.Label(glyph),
            }),
        ],
    }),
});

export default () => new_window({
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
            glyph: "󰐥",
            command: commands.poweroff,
        }),
        PowermenuButton({
            label: "Reboot", class_name: "reboot",
            glyph: "",
            command: commands.reboot,
        }),
        PowermenuButton({
            label: "Log Out", class_name: "logout",
            glyph: "",
            command: commands.logout,
        }),
        PowermenuButton({
            label: "Hibernate", class_name: "hibernate",
            glyph: "󰏤",
            command: commands.hibernate,
        }),
    ],
});
