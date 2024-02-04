import App from "resource:///com/github/Aylur/ags/app.js";
import WindowHandler from "./window.js";

import Audio from "resource:///com/github/Aylur/ags/service/audio.js";

// for usage outside the ags process (i.e. hyprland keybinds)
globalThis.toggle = (name: string) => {
    WindowHandler.toggle_window(name);
};

globalThis.mute = (type: "speaker" | "microphone") => {
    if (type === "speaker" && Audio.speaker)
        Audio.speaker.is_muted = !Audio.speaker.is_muted;
    else if (type === "microphone" && Audio.microphone)
        Audio.microphone.is_muted = !Audio.microphone.is_muted;
};

globalThis.volume = (type: "speaker" | "microphone", value: number) => {
    if (type === "speaker" && Audio.speaker)
        Audio.speaker.volume += value;
    else if (type === "microphone" && Audio.microphone)
        Audio.microphone.volume += value;
};

// service setups
Audio.maxStreamVolume = 1.0;

export default {
    style: App.configDir + "/style.css",
    windows: [
        WindowHandler.spawn_window("bar"),
    ],
};
