import App from "resource:///com/github/Aylur/ags/app.js";

// services
import Mpris from "resource:///com/github/Aylur/ags/service/audio.js";

import { exec } from "resource:///com/github/Aylur/ags/utils.js";
import { toggle_window, spawn_window } from "./window.js";

// build scss
const scss = App.configDir + "/style.scss";
const css = App.configDir + "/style.css";
exec(`sass ${scss} ${css}`);

// for usage outside the ags process (i.e. hyprland keybinds)
globalThis.toggle = (name: string) => toggle_window(name);
globalThis.mute = (type: "speaker" | "microphone") => {
    if (type === "speaker" && Mpris.speaker)
        Mpris.speaker.is_muted = !Mpris.speaker.is_muted
    else if (type === "microphone" && Mpris.microphone)
        Mpris.microphone.is_muted = !Mpris.microphone.is_muted
}

export default {
    style: App.configDir + "/style.css",
    maxStreamVolume: 1.0,
    windows: [
        spawn_window("bar"),
    ],
};
