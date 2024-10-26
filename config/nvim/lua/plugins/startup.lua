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
        "projekt0n/github-nvim-theme",
        config = function() vim.cmd("colorscheme github_dark_dimmed") end,
    },
    {
        "rmagatti/auto-session",
        config = function()
            vim.o.sessionoptions = "blank,buffers,curdir,folds,help,tabpages,winsize,winpos,terminal,localoptions"

            require("auto-session").setup({
                auto_restore = false,
            })
        end,
    },
}
