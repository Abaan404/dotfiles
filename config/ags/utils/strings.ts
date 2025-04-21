import AstalNetwork from "gi://AstalNetwork";
import AstalNotifd from "gi://AstalNotifd";

export function to_timestamp(value: number) {
    const hour = Math.round(value / 3600).toString().padStart(2, "0");
    const minute = Math.round(value / 60 % 60).toString().padStart(2, "0");
    const second = Math.round(value % 60).toString().padStart(2, "0");

    if (value > 3600)
        return `${hour}:${minute}:${second}`;
    else
        return `${minute}:${second}`;
}

export function truncate(value: string, limit: number) {
    if (value.length < limit)
        return value;

    return `${value.slice(0, limit - 3)}...`;
}

export function get_player_name(name: string) {
    return name
        .replace(/org\.mpris\.MediaPlayer2\./, "")
        .replace(/\..*/, "");
}

export function get_player_glyph(name: string) {
    switch (get_player_name(name)) {
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

export function get_active_profile_name(active_profile: string) {
    switch (active_profile) {
        case "power-saver":
            return "Power Saving";

        case "balanced":
            return "Balanced";

        case "performance":
            return "Performance";

        default:
            return "Performance";
    }
}

export function get_internet_name(internet: AstalNetwork.Internet) {
    switch (internet) {
        case AstalNetwork.Internet.DISCONNECTED:
            return "failed";

        case AstalNetwork.Internet.CONNECTED:
            return "success";

        case AstalNetwork.Internet.CONNECTING:
            return "waiting";

        default:
            return "failed";
    }
}

export function get_urgency_name(urgency: AstalNotifd.Urgency) {
    switch (urgency) {
        case AstalNotifd.Urgency.LOW:
            return "low";

        case AstalNotifd.Urgency.NORMAL:
            return "normal";

        case AstalNotifd.Urgency.CRITICAL:
            return "critical";

        default:
            return "low";
    }
}

export function symbolic_strength(value: number, array: string[], max: number) {
    const interp = Math.floor((value / max) * array.length);
    return array[Math.min(interp, array.length - 1)];
}
