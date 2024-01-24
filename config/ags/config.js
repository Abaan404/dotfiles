import App from "resource:///com/github/Aylur/ags/app.js"
import * as Utils from "resource:///com/github/Aylur/ags/utils.js"

// build scss
await Utils.execAsync([
    "sass",
    App.configDir + "/style.scss",
    App.configDir + "/style.css",
]);

await Utils.execAsync([
    "bun", "build", `${App.configDir}/ts/main.ts`,
    "--outdir", "/tmp/ags/js",
    "--external", "resource:///*",
    "--external", "gi://*",
    "--external", "cairo",
]).catch(console.error);

const main = await import(`file:///tmp/ags/js/main.js`);
export default main.default;
