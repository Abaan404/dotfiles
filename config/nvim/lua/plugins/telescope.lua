return {
    {
        "nvim-telescope/telescope.nvim",
        dependencies = {
            "nvim-lua/plenary.nvim",
        },
        opts = {
            defaults = {
                layout_config = {
                    scroll_speed = 2
                }
            }
        },
    }
}
