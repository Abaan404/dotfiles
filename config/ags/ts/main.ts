import App from "resource:///com/github/Aylur/ags/app.js";

import { exec } from "resource:///com/github/Aylur/ags/utils.js";
import { toggle_window, spawn_window } from "./window.js";

// build scss
const scss = App.configDir + "/style.scss";
const css = App.configDir + "/style.css";
exec(`sass ${scss} ${css}`);

// for usage outside the ags process (i.e. hyprland keybinds)
globalThis.toggle = (name: string) => toggle_window(name);

export default {
    closeWindowDelay: {
        "window-name": 500, // milliseconds
    },
    style: App.configDir + "/style.css",
    windows: [
        spawn_window("bar"),
    ],
};
