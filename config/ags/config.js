import Gtk from 'gi://Gtk?version=3.0';
import { toggle_window } from "./utils.js";

import { Bar } from "./modules/bar.js";
import { PowerMenuFactory } from "./modules/powermenu.js";
import { MediaFactory } from './modules/media.js';

// build scss
const scss = ags.App.configDir + "/style.scss";
const css = ags.App.configDir + "/style.css";
ags.Utils.exec(`sass ${scss} ${css}`);

// nice to have
globalThis.Gtk = Gtk

// declare global variables and functions to be called with `ags -r`
globalThis.toggle_powermenu = () => toggle_window("powermenu", PowerMenuFactory());
globalThis.toggle_audio = () => toggle_window("audio", MediaFactory());

export default {
    closeWindowDelay: {
        "window-name": 500, // milliseconds
    },
    style: ags.App.configDir + "/style.css",
    windows: [
        Bar,
    ],
};
