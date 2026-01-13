return {
    {
        "lukas-reineke/indent-blankline.nvim",
        main = "ibl",
        event = "BufReadPre",
        opts = {},
    },
    {
        "NvChad/nvim-colorizer.lua",
        event = "BufReadPre",
        config = function() require("colorizer").setup({}) end,
    },
    {
        "0x00-ketsu/autosave.nvim",
        event = "InsertEnter",
    },
    {
        "mbbill/undotree",
        event = "VeryLazy",
    },
    {
        "echasnovski/mini.nvim",
        event = "VeryLazy",
        version = "*",
        config = function()
            require("mini.align").setup()
            require("mini.animate").setup({
                cursor = { timing = function(_, n) return 100 / n end },
                scroll = { enable = false },
                resize = { enable = false },
                open = { enable = false },
                close = { enable = false },
            })
        end,
    },
}
