-- fix nvim not recognising common glsl filetypes
vim.api.nvim_create_autocmd({ "BufRead", "BufNewFile" }, {
    pattern = { "*.glsl", "*.vert", "*.tesc", "*.tese", "*.frag", "*.geom", "*.comp" },
    callback = function()
        vim.bo.filetype = "glsl"
    end
})

-- Open a file called question.pdf in the cwd
vim.api.nvim_create_user_command("OpenQuestion", function()
    local Job = require "plenary.job"

    Job:new({
        command = "zathura",
        args = { "question.pdf" },
    }):start()
end, {})

-- open all folds before opening
vim.api.nvim_create_autocmd({ "BufReadPost", "FileReadPost" }, { command = "normal zR" })

-- Usercommand to trim trailing whitespaces (if lsp.format isnt supproted)
vim.api.nvim_create_user_command("TrimWhitespace", "%s/\\s\\+$//e", {})
