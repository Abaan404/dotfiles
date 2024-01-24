// some useful commands
export const commands = {
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

    return `${value.slice(0, limit - 3)}...`
}
