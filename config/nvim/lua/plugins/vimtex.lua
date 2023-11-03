return {
    {
        "lervag/vimtex",
        dependencies = {
            {
                "iurimateus/luasnip-latex-snippets.nvim",
                config = function()
                    require("luasnip-latex-snippets").setup {
                        use_treesitter = true
                    }
                end,
            }
        },
        event = "BufReadPre",
        config = function()
            vim.cmd("filetype plugin on")

            local g = vim.g
            g.localleader = ","

            g.vimtex_quickfix_open_on_warning = false

            -- treesitter handles highlights
            g.vimtex_syntax_enabled = false

            -- compilation handled by LSP (texlab)
            g.vimtex_compiler_enabled = false
        end
    },
}
