import { commands, create_window } from "../utils.js";
const { Box, EventBox, Button, Label } = ags.Widget;

const MenuButton = ({label, className, glyph, command}) => EventBox({
    className: className,
    child: Box({
        halign: Gtk.Align.END,
        spacing: 15,
        children: [
            Label({
                className: "transition-text",
                label: label
            }),
            Button({
                onPrimaryClick: command,
                child: Label(glyph)
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
