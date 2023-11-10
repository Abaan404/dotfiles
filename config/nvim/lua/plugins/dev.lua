return {
    {
        "mfussenegger/nvim-dap",
        dependencies = {
            {
                "rcarriga/nvim-dap-ui",
                config = function()
                    require("dapui").setup()
                end
            }
        },
        event = "BufReadPre",
        ft = { "c", "cpp" },
        config = function()
            local dap = require("dap")
            local mason_registry = require("mason-registry")

            local codelldb = mason_registry.get_package("codelldb")
            dap.adapters.codelldb = {
                type = "server",
                port = "${port}",
                executable = {
                    command = codelldb:get_install_path() .. "/codelldb",
                    args = { "--port", "${port}" },
                }
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
        end
    },
    {
        "Civitasv/cmake-tools.nvim",
        ft = { "c", "cpp" },
        config = function()
            require("cmake-tools").setup({
                cmake_build_directory = "build/${variant:buildType}", -- this is used to specify generate directory for cmake, allows macro expansion
            })
        end
    },
}
