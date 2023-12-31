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
        "folke/persistence.nvim",
        opts = {
            options = { "buffers", "curdir", "tabpages", "winsize", "globals" },
            pre_save = function() vim.api.nvim_exec_autocmds("User", { pattern = "SessionSavePre" }) end,
        },
    },
}
