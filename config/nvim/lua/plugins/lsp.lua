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
                    text = {
                        [vim.diagnostic.severity.ERROR] = "",
                        [vim.diagnostic.severity.WARN] = "",
                        [vim.diagnostic.severity.HINT] = "",
                        [vim.diagnostic.severity.INFO] = " ",
                    },
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
                tinymist = {
                    exportPdf = "onType",
                    outputPath = "$root/$dir/$name",
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
                "asm_lsp",
                "bashls",
                "yamlls",
                "vimls",
                "verible",
                "matlab_ls",
                "pyright",
                "dockerls",
                "docker_compose_language_service",
                "texlab",
                "tinymist",
                "nixd",
                "vala_ls",
                "tailwindcss",
                "hyprls",
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
                css = { "prettier" },
                scss = { "prettier" },
                json = { "prettier" },
                yaml = { "prettier" },
                html = { "prettier" },
                markdown = { "prettier" },

                typst = { "typstyle" },
                nix = { "nixfmt" },
            },

            formatters = {
                prettier = {
                    prepend_args = { "--tab-width", "4" },
                },
                typstyle = {
                    prepend_args = { "--tab-width", "4" },
                },
                black = {
                    prepend_args = { "--line-length", "10000" },
                },
            },
        },
    },
    {
        "mfussenegger/nvim-jdtls",
        ft = { "java" },
        dependencies = {
            "neovim/nvim-lspconfig",
            "mfussenegger/nvim-dap",
        },
    },
}
