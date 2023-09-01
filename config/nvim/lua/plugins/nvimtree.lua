return {
    {
        "nvim-tree/nvim-tree.lua",
        version = "*",
        dependencies = {
            "nvim-tree/nvim-web-devicons",
        },
        config = function()
            require("nvim-tree").setup({
                git = {
                    enable = true,
                },
                renderer = {
                    highlight_git = true,
                    group_empty = true,
                    icons = {
                        show = {
                            git = true,
                        },
                    },
                },
            })
        end
    }
}
