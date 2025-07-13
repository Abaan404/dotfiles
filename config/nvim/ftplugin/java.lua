-- fix nvim not recognising common glsl filetypes
vim.api.nvim_create_autocmd({ "BufRead", "BufNewFile" }, {
    pattern = { "*.glsl", "*.vert", "*.tesc", "*.tese", "*.frag", "*.geom", "*.comp" },
    callback = function() vim.bo.filetype = "glsl" end,
})

-- attach jdtls
vim.api.nvim_create_autocmd("FileType", {
    pattern = "java",
    callback = function()
        local Job = require("plenary.job")

        local workspace_path = vim.fn.getcwd()
        local workspace_data_path = vim.fn.stdpath("data") .. "/jdtls/" .. workspace_path:gsub("/", ".")

        ---@diagnostic disable-next-line: missing-fields
        local result = Job:new({
            command = "nix-instantiate",
            args = {
                "--eval-only",
                "--expr",
                "(import <nixpkgs> {}).vscode-extensions.vscjava.vscode-java-debug.outPath",
            },
        }):sync()

        local debug_path = ""
        if result and result[1] then
            local outPath = string.sub(result[1], 2, string.len(result[1]) - 1)
            debug_path = vim.fn.glob(
                outPath
                    .. "/share/vscode/extensions/vscjava.vscode-java-debug/server/com.microsoft.java.debug.plugin-*.jar"
            )
        end

        local config = {
            cmd = {
                "jdtls",
                "--data",
                workspace_data_path,
            },
            root_dir = vim.fs.dirname(vim.fs.find({ "gradlew", ".git", "mvnw" }, { upward = true })[1]),

            init_options = {
                bundles = {
                    debug_path,
                },
            },
        }

        require("jdtls").start_or_attach(config)
    end,
})

-- open all folds before opening
vim.api.nvim_create_autocmd({ "BufReadPost", "FileReadPost" }, { command = "normal zR" })

-- Usercommand to trim trailing whitespaces (if lsp.format isnt supproted)
vim.api.nvim_create_user_command("TrimWhitespace", "%s/\\s\\+$//e", {})
