return {
    {
        "NvChad/nvterm",
        config = function()
            require("nvterm").setup({
                behavior = {
                    behavior = {
                        autoclose_on_quit = {
                            enabled = true,
                            confirm = false
                        }
                    }
                }
            })
        end,
    },
}
