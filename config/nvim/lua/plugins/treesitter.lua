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
                    "java",
                    "javascript",
                    "typescript",
                    "tsx",
                    "svelte",

                    "c",
                    "cpp",
                    "glsl",
                    "cmake",
                    "meson",

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

            -- attach ts to glsl ft
            for _, value in ipairs({ "glsl", "vert", "tesc", "tese", "frag", "geom", "comp" }) do
                vim.treesitter.language.register("glsl", value)
            end
        end
    }
}
