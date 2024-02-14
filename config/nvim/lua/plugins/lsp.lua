-- LSP Configuration & Plugins
return {
    {
        "neovim/nvim-lspconfig",
        -- event = "InsertEnter", -- lazy loading this causes it to not auto-attach?
        dependencies = {
            "j-hui/fidget.nvim",
            "williamboman/mason.nvim",
            "williamboman/mason-lspconfig.nvim",
            "WhoIsSethDaniel/mason-tool-installer.nvim",
            "folke/neodev.nvim",
            "RRethy/vim-illuminate",
            "hrsh7th/cmp-nvim-lsp",
        },
        config = function()
            -- Set up Mason before anything else
            require("mason").setup()
            require("mason-lspconfig").setup({
                ensure_installed = {
                    -- lua stuff
                    "lua_ls",

                    -- web dev stuff
                    "cssls",
                    "html",
                    "tsserver",
                    "svelte",

                    -- c/cpp stuff
                    "clangd",
                    "swift_mesonls",
                    "cmake",

                    -- python stuff
                    "pyright",

                    -- docker stuff
                    "docker_compose_language_service",
                    "dockerls",

                    -- bash stuff
                    "bashls",

                    -- typesetting stuff
                    "texlab",
                    "typst_lsp",

                    -- Java
                    "jdtls",

                    -- matlab
                    "matlab_ls",
                },
                automatic_installation = true,
            })

            require("mason-tool-installer").setup({
                ensure_installed = {
                    -- DAP for c/cpp/rust
                    "codelldb",

                    -- web dev stuff
                    "prettier",
                    "eslint_d",

                    -- lua
                    "stylua",

                    -- python
                    "black",
                },
            })

            -- Neodev setup before LSP config
            require("neodev").setup()

            -- Turn on LSP status information
            require("fidget").setup()

            -- Set up cool signs for diagnostics
            local signs = { Error = "", Warn = "", Hint = "", Info = " " }
            for type, icon in pairs(signs) do
                local hl = "DiagnosticSign" .. type
                vim.fn.sign_define(hl, { text = icon, texthl = hl, numhl = "" })
            end

            -- Diagnostic config
            vim.diagnostic.config({
                virtual_text = true,
                signs = {
                    active = signs,
                },
                update_in_insert = true,
                underline = true,
                severity_sort = true,
            })

            -- nvim-cmp supports additional completion capabilities, so broadcast that to servers
            local capabilities = vim.lsp.protocol.make_client_capabilities()
            capabilities = require("cmp_nvim_lsp").default_capabilities(capabilities)

            local settings = {
                lua_ls = {
                    Lua = {
                        completion = {
                            callSnippet = "Replace",
                        },
                        diagnostics = {
                            globals = { "vim" },
                        },
                        workspace = {
                            library = {
                                [vim.fn.expand("$VIMRUNTIME/lua")] = true,
                                [vim.fn.stdpath("config") .. "/lua"] = true,
                            },
                        },
                    },
                },
                typst_lsp = {
                    exportPdf = "onType", -- onSave
                },
                texlab = {
                    texlab = {
                        build = {
                            executable = "tectonic",
                            args = { "-X", "compile", "%f", "--keep-intermediates", "--keep-logs" },
                            onSave = true,
                            forwardSearchAfter = true,
                        },
                        forwardSearch = {
                            executable = "zathura",
                            args = {
                                "--synctex-forward",
                                "%l:1:%f",
                                "%p",
                            },
                        },
                    },
                },
                matlab_ls = {
                    matlab = {
                        indexWorkspace = true,
                        installPath = "/usr/local/MATLAB/R2023b",
                        matlabConnectionTiming = "onStart",
                        telemetry = true,
                    },
                },
            }

            -- setup lsp for all servers installed by mason
            for _, server in pairs(require("mason-lspconfig").get_installed_servers()) do
                require("lspconfig")[server].setup({
                    capabilities = capabilities,
                    settings = settings[server],
                })
            end

            -- TODO open a PR on mason to add glsl_analyzer
            if vim.fn.findfile("/usr/bin/glsl_analyzer") then
                require("lspconfig")["glsl_analyzer"].setup({
                    capabilities = capabilities,
                    settings = settings["glsl_analyzer"],
                })
            end
        end,
    },
    {
        "stevearc/conform.nvim",
        event = { "BufWritePre" },
        cmd = { "ConformInfo" },
        opts = {
            formatters_by_ft = {
                lua = { "stylua" },
                python = { "black" },

                -- eslint
                javascript = { "eslint_d" },
                typescript = { "eslint_d" },
                javascriptreact = { "eslint_d" },
                typescriptreact = { "eslint_d" },

                -- prettier moment
                css = { "pretter" },
                scss = { "prettier" },
                json = { "prettier" },
                yaml = { "prettier" },
                html = { "prettier" },
                markdown = { "prettier" },

                -- typst TODO mason pr
                typst = { "typstfmt" },
            },

            formatters = {
                prettier = {
                    prepend_args = { "--tab-width", "4" },
                },
            },
        },
    },
}
