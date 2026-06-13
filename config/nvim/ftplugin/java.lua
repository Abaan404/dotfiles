-- shada caches vim.g values, this path can change between updates. so instead of disabling it, just check if its valid
if not vim.g.JAVA_DEBUG_PATH or vim.fn.filereadable(vim.g.JAVA_DEBUG_PATH) == 0 then
    local Job = require("plenary.job")

    local result = Job:new({
        command = "nix-instantiate",
        args = {
            "--eval-only",
            "--expr",
            "(import <nixpkgs> {}).vscode-extensions.vscjava.vscode-java-debug.outPath",
        },
    }):sync()

    if result and result[1] then
        local outPath = string.sub(result[1], 2, string.len(result[1]) - 1)
        vim.g.JAVA_DEBUG_PATH = vim.fn.glob(
            outPath .. "/share/vscode/extensions/vscjava.vscode-java-debug/server/com.microsoft.java.debug.plugin-*.jar"
        )
    else
        vim.g.JAVA_DEBUG_PATH = ""
    end
end

-- attach jdtls
local config = {
    cmd = {
        "jdtls",
        "--data",
        vim.fn.stdpath("data") .. "/jdtls/" .. vim.fn.getcwd():gsub("/", "."),
    },
    root_dir = vim.fs.dirname(vim.fs.find({ "gradlew", ".git", "mvnw" }, { upward = true })[1]),

    init_options = {
        bundles = {
            vim.g.JAVA_DEBUG_PATH,
        },
    },
}

require("jdtls").start_or_attach(config)
