import App from "resource:///com/github/Aylur/ags/app.js"
import { execAsync } from "resource:///com/github/Aylur/ags/utils.js"

// cmake is better than this honestly

// this does mean it needs to recompile every
// refresh but its soo fast that it shouldnt
// even be noticable

const dir = "/tmp/ags/js"
const promises = [];
const files = [
    "/ts/main.ts",
    "/ts/utils.ts",
    "/ts/window.ts",
    "/ts/variables.ts",
    "/ts/windows/bar.ts",
    "/ts/windows/powermenu.ts",
    "/ts/windows/media.ts",
    "/ts/windows/player.ts",
];

files.forEach(file => {
    let outDir = dir;
    if (file.startsWith("/ts/windows"))
        outDir = `${dir}/windows`;

    promises.push(
        execAsync(["bun", "build",
            App.configDir + file,
            "--outdir", outDir,
            "--external", "*",
        ])
    );
})

await Promise.all(promises);
const main = await import(`file://${dir}/main.js`);
export default main.default;
