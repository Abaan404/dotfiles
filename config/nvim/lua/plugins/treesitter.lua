return {
    {
        "nvim-treesitter/playground",
    },
    {
        "nvim-treesitter/nvim-treesitter",
        config = function()
            ---@diagnostic disable-next-line: missing-fields
            require("nvim-treesitter.configs").setup({
                ensure_installed = {
                    "vim",
                    "vimdoc",
                    "bash",

                    "lua",

                    "html",
                    "css",
                    "scss",
                    "javascript",
                    "typescript",
                    "tsx",
                    "svelte",

                    "c",
                    "java",

                    "markdown",
                    "markdown_inline",

                    "python",
                    "dockerfile",

                    "ini",
                    "json",
                    "toml",
                    "yuck",

                    "latex",
                    "matlab",
                },

                sync_install = false,
                auto_install = true,

                highlight = {
                    enable = true,
                    additional_vim_regex_highlighting = false,
                },
            })
        end
    }
}
