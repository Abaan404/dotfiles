// some useful commands
export const commands = {
    powermenu: "ags --toggle-window 'powermenu'",
    calendar: "ags --toggle-window 'glance'",
    launcher: "pkill rofi || rofi -show drun",

    poweroff: "systemctl poweroff",
    reboot: "systemctl reboot",
    hibernate: "systemctl hibernate",
    logout: "hyprctl dispatch exit",

    weather: "xdg-open https://openweathermap.com",

    brightness: {
        increase: "brightnessctl set 10%+",
        decrease: "brightnessctl set 10%-",
    },
};

export function symbolic_strength({ value, array, max = 100 }) {
    const interp = Math.floor((value / max) * array.length);
    return array[Math.min(interp, array.length - 1)];
}

export function get_player_glyph(name: string) {
    switch (name) {
        case "firefox":
            return "";
        case "spotify":
            return "";
        case "discord":
            return "";
        default:
            return "";
    }
}

export function to_timestamp(value: number) {
    const hour = Math.round(value / 3600).toString().padStart(2, "0")
    const minute = Math.round(value / 60 % 60).toString().padStart(2, "0")
    const second = Math.round(value % 60).toString().padStart(2, "0");
    if (value > 3600)
        return `${hour}:${minute}:${second}`
    else
        return `${minute}:${second}`
}
