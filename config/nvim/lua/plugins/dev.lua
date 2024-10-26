return {
    {
        "mfussenegger/nvim-dap",
        dependencies = {
            "rcarriga/nvim-dap-ui",
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
        "rcarriga/nvim-dap-ui",
        dependencies = {
            "mfussenegger/nvim-dap",
            "nvim-neotest/nvim-nio",
        },
        config = function()
            require("dapui").setup({
                layouts = {
                    {
                        elements = {
                            {
                                id = "repl",
                                size = 0.5,
                            },
                            {
                                id = "console",
                                size = 0.5,
                            },
                        },
                        position = "bottom",
                        size = 15,
                    },
                    {
                        elements = {
                            {
                                id = "scopes",
                                size = 0.5,
                            },
                            {
                                id = "stacks",
                                size = 0.5,
                            },
                        },
                        position = "right",
                        size = 60,
                    },
                },
            })
        end,
    },
    {
        "Civitasv/cmake-tools.nvim",
        ft = { "c", "cpp" },
        config = function()
            require("cmake-tools").setup({
                cmake_build_directory = "build/${variant:buildType}", -- this is used to specify generate directory for cmake, allows macro expansion
            })
        end,
    },
}
