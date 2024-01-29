-- fix nvim not recognising common glsl filetypes
vim.api.nvim_create_autocmd({ "BufRead", "BufNewFile" }, {
    pattern = { "*.glsl", "*.vert", "*.tesc", "*.tese", "*.frag", "*.geom", "*.comp" },
    callback = function() vim.bo.filetype = "glsl" end,
})

-- Open a pdf file from the cwd
vim.api.nvim_create_user_command("OpenPDF", function(opts)
    local Job = require("plenary.job")

    Job:new({
        command = "zathura",
        args = { opts.fargs[1] },
    }):start()
end, {
    nargs = 1,
    complete = function()
        local dirs = require("plenary.scandir").scan_dir(".", { depth = 1 })
        local pdf_files = {}

        for _, value in ipairs(dirs) do
            if value:match(".+%.pdf$") then table.insert(pdf_files, value) end
        end

        return pdf_files
    end,
})

-- open all folds before opening
vim.api.nvim_create_autocmd({ "BufReadPost", "FileReadPost" }, { command = "normal zR" })

-- Usercommand to trim trailing whitespaces (if lsp.format isnt supproted)
vim.api.nvim_create_user_command("TrimWhitespace", "%s/\\s\\+$//e", {})
