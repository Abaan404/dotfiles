import { App, Utils } from "./imports.js";

import { Bar } from "./modules/bar.js"
import { PowerMenuFactory } from "./modules/powermenu.js";
import { MediaFactory } from './modules/media.js';

import { toggle_window } from "./utils.js";

// build scss
const scss = App.configDir + "/style.scss";
const css = App.configDir + "/style.css";
Utils.exec(`sass ${scss} ${css}`);

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
