export function get_player_glyph(name: string) {
    name = name
        .replace(/org\.mpris\.MediaPlayer2\./, "")
        .replace(/\..*/, "");

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

export function symbolic_strength(value: number, array: string[], max: number) {
    const interp = Math.floor((value / max) * array.length);
    return array[Math.min(interp, array.length - 1)];
}
