-- LSP Configuration & Plugins
return {
    {
        "neovim/nvim-lspconfig",
        -- event = "InsertEnter", -- lazy loading this causes it to not auto-attach?
        dependencies = {
            "j-hui/fidget.nvim",
            "folke/neodev.nvim",
            "RRethy/vim-illuminate",
            "hrsh7th/cmp-nvim-lsp",
        },
        config = function()
            -- Neodev setup before LSP config
            require("neodev").setup()

            -- Turn on LSP status information
            require("fidget").setup({})

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
                float = {
                    focusable = true,
                    style = "minimal",
                    border = "rounded",
                    source = true,
                    header = "",
                    prefix = "",
                },
            })

            vim.api.nvim_create_autocmd({ "CursorHold", "CursorHoldI" }, {
                callback = function() vim.diagnostic.open_float(nil, { focus = false, scope = "cursor" }) end,
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
                    exportPdf = "onSave", -- onSave
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
                nil_ls = {
                    ["nil"] = {
                        formatting = {
                            command = { "nixfmt" },
                        },
                    },
                },
            }

            -- NOTE: servers are downloaded externally, mason is no longer used in these dots
            local servers = {
                "clangd",
                "glsl_analyzer",
                "cmake",
                "mesonlsp",
                "html",
                "cssls",
                "jsonls",
                "lua_ls",
                "ts_ls",
                "kotlin_language_server",
                "jdtls",
                "bashls",
                "yamlls",
                "vimls",
                "verible",
                "matlab_ls",
                "pyright",
                "dockerls",
                "docker_compose_language_service",
                "texlab",
                "typst_lsp",
                "nil_ls",
            }

            -- setup lsp for all servers installed by nix (see nix/packages/dev.nix)
            for _, server in ipairs(servers) do
                require("lspconfig")[server].setup({
                    capabilities = capabilities,
                    settings = settings[server],
                })
            end
        end,
    },
    {
        "stevearc/conform.nvim",
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

                typst = { "typstfmt" },
            },

            formatters = {
                prettier = {
                    prepend_args = { "--tab-width", "4" },
                },
            },
        },
    },
    {
        "mfussenegger/nvim-jdtls",
        ft = { "java" },
        dependencies = {
            "neovim/nvim-lspconfig",
        },
        config = function()
            local config = {
                cmd = { "jdtls" },
                root_dir = vim.fs.dirname(vim.fs.find({ "gradlew", ".git", "mvnw" }, { upward = true })[1]),
            }
            require("jdtls").start_or_attach(config)
        end,
    },
}
