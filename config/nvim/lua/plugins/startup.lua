return {
    {
        "goolord/alpha-nvim",
        requires = { "nvim-tree/nvim-web-devicons" },
        config = function()
            local startify = require("alpha.themes.startify")

            -- ok i gotta do atleast some ricing
            startify.section.header.val = {
                "                                                            ",
                "         ███╗   ██╗███████╗ ██████╗ ██╗   ██╗██╗███╗   ███╗ ",
                "         ████╗  ██║██╔════╝██╔═══██╗██║   ██║██║████╗ ████║ ",
                "         ██╔██╗ ██║█████╗  ██║   ██║██║   ██║██║██╔████╔██║ ",
                "         ██║╚██╗██║██╔══╝  ██║   ██║╚██╗ ██╔╝██║██║╚██╔╝██║ ",
                "         ██║ ╚████║███████╗╚██████╔╝ ╚████╔╝ ██║██║ ╚═╝ ██║ ",
                "         ╚═╝  ╚═══╝╚══════╝ ╚═════╝   ╚═══╝  ╚═╝╚═╝     ╚═╝ ",
                "                                                            ",
            }
            require("alpha").setup(startify.config)
        end,
    },
    {
        "sainnhe/sonokai",
        config = function()
            vim.g.sonokai_style = "andromeda"
            vim.cmd("colorscheme sonokai")
        end,
    },
    {
        "rmagatti/auto-session",
        config = function()
            vim.o.sessionoptions = "curdir,folds,help,tabpages,terminal,localoptions"

            require("auto-session").setup({
                auto_restore = false,
            })
        end,
    },
}
