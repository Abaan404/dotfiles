return {
    {
        "romgrk/barbar.nvim",
        event = "BufReadPre",
        dependencies = {
            "lewis6991/gitsigns.nvim",     -- OPTIONAL: for git status
            "nvim-tree/nvim-web-devicons", -- OPTIONAL: for file icons
        },
        version = "^1.0.0",                -- optional: only update when a new 1.x version is released
        opts = {
            highlight_visible = false,
            sidebar_filetypes = {
                NvimTree = true
            },
            icons = {
                separator = {
                    left = "│"
                },
                pinned = {
                    button = "",
                    filename = true
                },
                inactive = {
                    separator = {
                        left = "│"
                    }
                }
            }
        }
    },
    {
        "nvim-lualine/lualine.nvim",
        lazy = false,
        config = function()
            require("lualine").setup({
                options = {
                    icons_enabled = true,
                    component_separators = "|",
                    section_separators = "",
                },
            })
        end
    }
}
