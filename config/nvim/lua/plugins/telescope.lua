return {
    {
        "nvim-telescope/telescope.nvim",
        tag = "0.1.1",
        dependencies = { "nvim-lua/plenary.nvim" },
        opts = {
            defaults = {
                layout_config = {
                    scroll_speed = 2
                }
            }
        }
    }
}
