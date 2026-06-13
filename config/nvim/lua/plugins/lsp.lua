-- LSP Configuration & Plugins
return {
    {
        "neovim/nvim-lspconfig",
        -- event = "InsertEnter", -- lazy loading this causes it to not auto-attach?
        dependencies = {
            "j-hui/fidget.nvim",
            "RRethy/vim-illuminate",
            "saghen/blink.cmp",
            "folke/neoconf.nvim",
            not require("utils.os").is_nixos() and "williamboman/mason.nvim" or nil,
            not require("utils.os").is_nixos() and "williamboman/mason-lspconfig.nvim" or nil,
        },
        config = function()
            -- per project settings
            require("neoconf").setup({})

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

            local servers = {
                { "slangd" },
                { "clangd" },
                { "glsl_analyzer" },
                { "cmake" },
                { "mesonlsp" },
                { "html" },
                { "cssls" },
                { "jsonls" },
                { "sqruff" },
                {
                    "lua_ls",
                    {
                        settings = {
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
                    },
                },
                { "ts_ls" },
                { "kotlin_language_server" },
                { "asm_lsp" },
                { "bashls" },
                { "yamlls" },
                { "vimls" },
                {
                    "verible",
                    {
                        cmd = { "verible-verilog-ls", "--rules_config_search", "--flagfile", ".rules.verible_format" },
                    },
                },
                { "pyright" },
                { "dockerls" },
                { "docker_compose_language_service" },
                {
                    "texlab",
                    {
                        settings = {
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
                    },
                },
                {
                    "tinymist",
                    {
                        settings = {
                            exportPdf = "onType",
                            outputPath = "$root/$dir/$name",
                        },
                    },
                },
                { "nixd" },
                { "vala_ls" },
                { "tailwindcss" },
                { "hyprls" },
            }

            local capabilities = require("blink.cmp").get_lsp_capabilities()
            if not require("utils.os").is_nixos() then
                -- use mason on non nixos machines
                -- otherwise setup lsp for all servers installed by nix (see nix/packages/dev.nix)
                local mason = require("mason")
                local mason_lspconfig = require("mason-lspconfig")

                mason.setup()
                mason_lspconfig.setup({
                    ensure_installed = vim.tbl_map(function(s) return s[1] end, servers),
                    automatic_installation = true,
                })
            end

            for _, server in ipairs(servers) do
                local name, overrides = server[1], server[2] or {}
                overrides.capabilities = capabilities

                vim.lsp.enable(name)
                vim.lsp.config(name, overrides)
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
                    prepend_args = { "--tab-width", "4", "--line-width", "120" },
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
    {
        "pandalec/gradle.nvim",
        ft = { "java" },
        dependencies = {
            "nvim-telescope/telescope.nvim",
            "akinsho/toggleterm.nvim",
        },
        config = function()
            require("gradle").setup({
                keymaps = false,
            })
        end,
    },
}
