return {
    {
        "numToStr/Comment.nvim",
        keys = {
            { "<leader>/",  mode = "n" },
            { "<leader>/",  mode = "v" },
            { "<leader>\\", mode = "n" },
            { "<leader>\\", mode = "v" },
        },
        opts = {
            toggler = {
                line = "<leader>/",
                block = "<leader>\\"
            },
            opleader = {
                line = "<leader>/",
                block = "<leader>\\"
            }
        }
    },
    {
        "windwp/nvim-autopairs",
        event = "InsertEnter",
        opts = {}
    },
    {
        "kylechui/nvim-surround",
        version = "*", -- Use for stability; omit to use `main` branch for the latest features
        event = "VeryLazy",
        config = function()
            require("nvim-surround").setup({
                -- Configuration here, or leave empty to use defaults
            })
        end
    },
    {
        'Wansmer/treesj',
        keys = { '<space>m', '<space>j', '<space>s' },
        dependencies = { 'nvim-treesitter/nvim-treesitter' },
        config = function()
            require('treesj').setup({
                use_default_keymaps = false,
            })
        end,
    },
    {
        "danymat/neogen",
        dependencies = "nvim-treesitter/nvim-treesitter",
        config = function()
            require("neogen").setup({
                languages = {
                    ["c.doxygen"] = require("neogen.configurations.c"),
                    ["cpp.doxygen"] = require("neogen.configurations.cpp"),
                    ["python.google_docstrings"] = require("neogen.configurations.python"),
                    ["javascript.jsdoc"] = require("neogen.configurations.javascript"),
                    ["javascriptreact.jsdoc"] = require("neogen.configurations.javascriptreact"),
                },
                snippet_engine = "luasnip",
            })
        end
    }
}
