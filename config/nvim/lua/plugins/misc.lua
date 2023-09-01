return {
    {
        "lukas-reineke/indent-blankline.nvim",
        event = "BufReadPre",
        opts = {
            show_current_context = true,
            show_current_context_start = true,
        }
    },
    {
        "NvChad/nvim-colorizer.lua",
        event = "BufReadPre",
        config = function()
            require("colorizer").setup({})
        end
    },
    {
        "koenverburg/peepsight.nvim",
        opts = {
                -- go
                "function_declaration",
                "method_declaration",
                "func_literal",

                -- typescript
                "class_declaration",
                "method_definition",
                "arrow_function",
                "function_declaration",
                "generator_function_declaration",
                "object",

                -- c/c++/python
                "class_definition",
                "function_definition",

                -- LaTeX
                "math_environment",
                "generic_environment",
                "section"
        }
    },
    {
        "0x00-ketsu/autosave.nvim",
        event = "InsertEnter"
    },
    {
        "mbbill/undotree",
        event = "VeryLazy"
    }
}
