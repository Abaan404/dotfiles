-- Autocompletion
return {
    {
        "saghen/blink.cmp",
        dependencies = {
            "L3MON4D3/LuaSnip",
            "xzbdmw/colorful-menu.nvim",
            "rafamadriz/friendly-snippets",
        },
        version = "1.*",
        opts = {
            keymap = {
                preset = "default",
                ["<CR>"] = { 'select_and_accept', 'fallback' },
                ["<Tab>"] = { "select_next", "fallback" },
                ["<S-Tab>"] = { "select_prev", "fallback" },
            },
            signature = { enabled = true },
            appearance = {
                nerd_font_variant = "mono",
            },
            completion = {
                documentation = {
                    auto_show = true,
                },
                list = {
                    selection = {
                        preselect = false,
                    },
                },
                menu = {
                    draw = {
                        columns = { { "kind_icon" }, { "label", gap = 1 } },
                        components = {
                            label = {
                                text = function(ctx) return require("colorful-menu").blink_components_text(ctx) end,
                                highlight = function(ctx)
                                    return require("colorful-menu").blink_components_highlight(ctx)
                                end,
                            },
                        },
                    },
                },
            },
            sources = {
                default = { "lsp", "path", "snippets", "buffer" },
            },
            fuzzy = { implementation = "lua" },
        },
        opts_extend = {
            "sources.default",
        },
    },
}
