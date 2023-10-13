import Gtk from 'gi://Gtk?version=3.0';
import { commands, create_window } from "../utils.js";

import { Widget } from "../imports.js";

const MenuButton = ({label, className, glyph, command}) => Widget.EventBox({
    className: className,
    child: Widget.Box({
        halign: Gtk.Align.END,
        spacing: 15,
        children: [
            Widget.Label({
                className: "transition-text",
                label: label
            }),
            Widget.Button({
                onPrimaryClick: command,
                child: Widget.Label(glyph)
            })
        ]
    })
})

export const PowerMenuFactory = () => create_window({
    className: "powermenu",
    anchor: ["right"],
    box: {
        spacing: 20,
        orientation: Gtk.Orientation.VERTICAL
    },
    children: [
        MenuButton({
            label: "Shutdown", className: "power",
            glyph: "󰐥",
            command: commands.poweroff
        }),
        MenuButton({
            label: "Reboot", className: "reboot",
            glyph: "",
            command: commands.reboot
        }),
        MenuButton({
            label: "Log Out", className: "logout",
            glyph: "",
            command: commands.logout
        }),
        MenuButton({
            label: "Hibernate", className: "hibernate",
            glyph: "󰏤",
            command: commands.hibernate
        }),
    ]
})
