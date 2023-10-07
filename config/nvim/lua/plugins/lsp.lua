-- LSP Configuration & Plugins
return {
    {
        "neovim/nvim-lspconfig",
        -- event = "InsertEnter", -- lazy loading this causes it to not auto-attach?
        dependencies = {
            {
                "j-hui/fidget.nvim",
                tag = "legacy"
            },
            "williamboman/mason.nvim",
            "williamboman/mason-lspconfig.nvim",
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
                    "denols",

                    -- c/cpp stuff
                    "clangd",

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
                    "matlab_ls"
                },
                automatic_installation = true,
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
            local config = {
                virtual_text = false,
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
                    source = "always",
                    header = "",
                    prefix = "",
                },
            }
            vim.diagnostic.config(config)

            -- This function gets run when an LSP connects to a particular buffer.
            local on_attach = function(client, bufnr)
                if client.resolved_capabilities.document_highlight then
                    vim.cmd [[
                    hi! LspReferenceRead cterm=bold ctermbg=red guibg=LightYellow
                    hi! LspReferenceText cterm=bold ctermbg=red guibg=LightYellow
                    hi! LspReferenceWrite cterm=bold ctermbg=red guibg=LightYellow
                    ]]
                    vim.api.nvim_create_augroup("lsp_document_highlight", {
                        clear = false
                    })
                    vim.api.nvim_clear_autocmds({
                        buffer = bufnr,
                        group = "lsp_document_highlight",
                    })
                    vim.api.nvim_create_autocmd({ "CursorHold", "CursorHoldI" }, {
                        group = "lsp_document_highlight",
                        buffer = bufnr,
                        callback = vim.lsp.buf.document_highlight,
                    })
                    vim.api.nvim_create_autocmd({ "CursorMoved", "CursorMovedI" }, {
                        group = "lsp_document_highlight",
                        buffer = bufnr,
                        callback = vim.lsp.buf.clear_references,
                    })
                end
                -- Create a command `:Format` local to the LSP buffer
                vim.api.nvim_buf_create_user_command(bufnr, "Format", function(_)
                    vim.lsp.buf.format()
                end, { desc = "Format current buffer with LSP" })

                -- Attach and configure vim-illuminate
                require("illuminate").on_attach(client)
            end

            vim.cmd [[autocmd! CursorHold,CursorHoldI * lua vim.diagnostic.open_float(nil, {focus=false, scope="cursor"})]]

            -- nvim-cmp supports additional completion capabilities, so broadcast that to servers
            local capabilities = vim.lsp.protocol.make_client_capabilities()
            capabilities = require("cmp_nvim_lsp").default_capabilities(capabilities)

            -- setup lsp for all other server installed by mason
            for _, server in pairs(require("mason-lspconfig").get_installed_servers()) do
                require("lspconfig")[server].setup({
                    on_attach = on_attach,
                    capabilities = capabilities,
                })
            end

            -- Lua
            require("lspconfig")["lua_ls"].setup({
                on_attach = on_attach,
                capabilities = capabilities,
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
            })

            -- Texlab
            require("lspconfig")["texlab"].setup({
                on_attach = on_attach,
                capabilities = capabilities,
                settings = {
                    texlab = {
                        build = {
                            executable = "tectonic",
                            args = { "-X", "compile", "%f", "--keep-intermediates", "--keep-logs" },
                            onSave = true,
                            forwardSearchAfter = true
                        },
                        forwardSearch = {
                            executable = "zathura",
                            args = {
                                '--synctex-forward',
                                '%l:1:%f',
                                '%p',
                            }
                        }
                    }
                }
            })

            require("lspconfig")["matlab_ls"].setup({
                on_attach = on_attach,
                capabilities = capabilities,
                settings = {
                    matlab = {
                        indexWorkspace = true,
                        installPath = "/usr/local/MATLAB/R2023b",
                        matlabConnectionTiming = "onStart",
                        telemetry = true,
                    },
                },
            })

            -- Python
            require("lspconfig")["pyright"].setup({
                on_attach = on_attach,
                capabilities = capabilities,
                settings = {
                    pyright = {
                        plugins = {
                            pylint = { enabled = true },
                        },
                    },
                },
            })
        end,
    }
}
