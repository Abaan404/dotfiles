return {
    {
        "mfussenegger/nvim-dap",
        dependencies = {
            "neovim/nvim-lspconfig",
        },
        event = "BufReadPre",
        config = function()
            local dap = require("dap")

            dap.adapters.codelldb = {
                type = "server",
                port = "${port}",
                executable = {
                    command = "codelldb",
                    args = { "--port", "${port}" },
                },
            }

            dap.configurations.cpp = {
                {
                    name = "Launch file",
                    type = "codelldb",
                    request = "launch",
                    program = function()
                        ---@diagnostic disable-next-line: redundant-parameter
                        return vim.fn.input("Path to executable: ", vim.fn.getcwd() .. "/", "file")
                    end,
                    cwd = "${workspaceFolder}",
                    stopOnEntry = false,
                },
            }

            -- If you want to use this for Rust and C, add something like this:
            dap.configurations.c = dap.configurations.cpp
            dap.configurations.rust = dap.configurations.cpp
        end,
    },
    {
        "igorlfs/nvim-dap-view",
        dependencies = {
            "mfussenegger/nvim-dap",
            "sainnhe/sonokai",
        },
        config = function()
            require("dap-view").setup({
                winbar = {
                    sections = {
                        "watches",
                        "scopes",
                        "exceptions",
                        "breakpoints",
                        "threads",
                        "repl",
                        "disassembly",
                    },
                },
                windows = {
                    size = 0.40,
                    position = "right",
                    terminal = {
                        size = 0.33,
                        position = "below",
                        -- List of debug adapters for which the terminal should be ALWAYS hidden
                        -- Can also be set to "true" to never show the terminal
                        hide = {},
                    },
                },
            })
        end,
    },
    {
        "https://codeberg.org/Jorenar/nvim-dap-disasm.git",
        dependencies = {
            "mfussenegger/nvim-dap",
            "igorlfs/nvim-dap-view",
        },
        config = function()
            require("dap-disasm").setup({
                dapview_register = true,
                dapview = {
                    keymap = "D",
                    label = "Disassembly",
                    short_label = "󰒓 [D]",
                },
            })
        end,
    },
    {
        "Civitasv/cmake-tools.nvim",
        ft = { "c", "cpp", "cmake", "slang" },
        config = function()
            require("cmake-tools").setup({
                cmake_build_directory = "build/${variant:buildType}", -- this is used to specify generate directory for cmake, allows macro expansion
            })
        end,
    },
}
