return {
    {
        "akinsho/toggleterm.nvim",
        version = "*",
        config = function()
            -- ugly way to allow :wqa without neovim getting angry
            vim.api.nvim_create_autocmd({ "TermEnter" }, {
                callback = function()
                    for _, buffers in ipairs(vim.fn.getbufinfo()) do
                        local filetype = vim.api.nvim_buf_get_option(buffers.bufnr, "filetype")
                        if filetype == "toggleterm" then
                            vim.api.nvim_create_autocmd({ "BufWriteCmd", "FileWriteCmd", "FileAppendCmd" }, {
                                buffer = buffers.bufnr,
                                command = "q!",
                            })
                        end
                    end
                end,
            })

            require("toggleterm").setup()
        end,
    },
}
