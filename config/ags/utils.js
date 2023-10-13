import { App, Widget } from "./imports.js";

// common useful commands
export const commands = {
    powermenu: "ags --toggle-window 'powermenu'",
    calendar: "ags --toggle-window 'glance'",
    launcher: "pkill rofi || rofi -show drun",

    poweroff: "systemctl poweroff",
    reboot: "systemctl reboot",
    hibernate: "systemctl hibernate",
    logout: "hyprctl dispatch exit",

    weather: "xdg-open https://openweathermap.com",

    player: {
        next: "playerctl next",
        previous: "playerctl previous",
        toggle: "playerctl play-pause",
    },

    sink: {
        mute: "pamixer -t",
        increase: "pamixer -i 5",
        decrease: "pamixer -d 5",
    },

    source: {
        mute: "pamixer --default-source -t",
        increase: "pamixer --default-source -i 5",
        decrease: "pamixer --default-source -d 5",
    },

    brightness: {
        increase: "brightnessctl set 10%+",
        decrease: "brightnessctl set 10%-",
    },
};

export function symbolic_strength({ value, array, max = 100 }) {
    const interp = Math.floor((value / max) * array.length);
    return array[Math.min(interp, array.length - 1)];
}

export function toggle_window(name, window) {
    if (App.windows.has(name)) {
        App.closeWindow(name);
        App.removeWindow(name);
    }
    else {
        App.addWindow(window);
        App.openWindow(name);
    }
}

export function create_window({className, children, box, ...other}) {
    return Widget.Window({
        name: className,
        popup: true,
        ...other,
        child: Widget.Box({
            className: className,
            children: [
                Widget.Box({
                    className: "layout-box",
                    children: children,
                    ...box,
                })
            ]
        }),
    });
}
