return {
    {
        "nvim-telescope/telescope.nvim",
        tag = "0.1.1",
        dependencies = {
            "nvim-lua/plenary.nvim",
            "nvim-telescope/telescope-dap.nvim"
        },
        opts = {
            defaults = {
                layout_config = {
                    scroll_speed = 2
                }
            }
        },
        config = function()
            require('telescope').load_extension('dap')
        end,
    }
}
