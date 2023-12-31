return {
    {
        "akinsho/toggleterm.nvim",
        version = "*",
        config = function()
            local toggleterm = require("toggleterm")

            -- -- ugly way to allow :wqa without neovim getting angry, might belong in a toggleterm PR
            -- local close_terminals = function()
            --     for _, buffers in ipairs(vim.fn.getbufinfo()) do
            --         local filetype = vim.api.nvim_buf_get_option(buffers.bufnr, 'filetype')
            --         if filetype == 'toggleterm' then
            --             vim.cmd("!logger " .. filetype)
            --             vim.api.nvim_create_autocmd({ "BufWriteCmd", "FileWriteCmd", "FileAppendCmd" }, {
            --                 buffer = buffers.bufnr,
            --                 command = "bdelete! " .. buffers.bufnr
            --             })
            --         end
            --     end
            -- end
            -- vim.api.nvim_create_autocmd({ "TermEnter" }, { callback = close_terminals })

            toggleterm.setup({})
        end,
    },
}
