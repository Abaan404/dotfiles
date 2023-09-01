return {
    {
        "tpope/vim-fugitive",
        event = "CmdlineEnter",
        lazy = false,
    },
    {
        "lewis6991/gitsigns.nvim",
        event = "VeryLazy",
        config = function()
            require("gitsigns").setup({
                current_line_blame_opts = {
                    -- disappears on insert mode anyways
                    delay = 0
                }
            })
        end
    }
}
