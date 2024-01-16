import App from "resource:///com/github/Aylur/ags/app.js"
import { execAsync } from "resource:///com/github/Aylur/ags/utils.js"

const dir = "/tmp/ags/js";

await execAsync([
    "bun", "build", `${App.configDir}/ts/main.ts`,
    "--outdir", dir,
    "--external", "resource:///*",
    "--external", "gi://*",
    "--external", "cairo",
]).catch(console.error);

const main = await import(`file://${dir}/main.js`);
export default main.default;
