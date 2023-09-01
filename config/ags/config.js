import { Bar } from "./modules/bar.js";

// build scss
const scss = ags.App.configDir + "/style.scss";
const css = ags.App.configDir + "/style.css";
ags.Utils.exec(`sass ${scss} ${css}`);

export default {
    closeWindowDelay: {
        "window-name": 500, // milliseconds
    },
    style: ags.App.configDir + "/style.css",
    windows: [
        Bar,
    ],
};
