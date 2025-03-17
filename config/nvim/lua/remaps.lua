local set = vim.keymap.set

-- toggle relativenumber
set("n", "<leader>rn", "<cmd>setl rnu! <CR>")

-- soft word-wrap motion
set("n", "<Down>", "gj")
set("n", "<Up>", "gk")

-- remap <Shift/C> + <Up/Down>
for _, mode in ipairs({ "v", "n", "i" }) do
    set(mode, "<C-Up>", "<C-y>")
    set(mode, "<C-Down>", "<C-e>")
    set(mode, "<S-Up>", "<S-{>")
    set(mode, "<S-Down>", "<S-}>")
end

-- select buffer using alt + <num>
for i = 1, 9, 1 do
    set("n", string.format("<A-%s>", i), string.format("<Cmd>BufferGoto %s<CR>", i))
end

-- Neotree
set("n", "<C-n>", "<Cmd>Neotree toggle<CR>");
set("n", "<leader>e", "<Cmd>Neotree action=focus<CR>");

-- Telescope
local telescope_builtin = require("telescope.builtin")

set("n", "<leader>ff", telescope_builtin.find_files)
set("n", "<leader>fa", function() telescope_builtin.find_files({ follow = true, no_ignore = true, hidden = true }) end)
set("n", "<leader>fw", telescope_builtin.live_grep)
set("n", "<leader>fb", telescope_builtin.buffers)
set("n", "<leader>fh", telescope_builtin.help_tags)
set("n", "<leader>fm", telescope_builtin.marks)
set("n", "<leader>fo", telescope_builtin.oldfiles)
set("n", "<leader>fz", telescope_builtin.current_buffer_fuzzy_find)

set("n", "<leader>gs", telescope_builtin.git_status)
set("n", "<leader>gS", telescope_builtin.git_stash)
set("n", "<leader>gc", telescope_builtin.git_commits)

-- TreeSJ
local treesj = require("treesj")

set("n", "<leader>ss", treesj.toggle)
set("n", "<leader>sr", function() treesj.toggle({ split = { recursive = true } }) end)

-- ToggleTerm
set({ "n", "t", "v", "i" }, "<A-t>", "<cmd>ToggleTerm direction=float<CR>")

-- UndoTree
set("n", "<leader>u", vim.cmd.UndotreeToggle)

-- Barbar
set("n", "<A-Left>", "<Cmd>BufferPrevious<CR>")
set("n", "<A-Right>", "<Cmd>BufferNext<CR>")

set("n", "<A-S-Left>", "<Cmd>BufferMovePrevious<CR>")
set("n", "<A-S-Right>", "<Cmd>BufferMoveNext<CR>")

set("n", "<A-p>", "<Cmd>BufferPin<CR>")

set("n", "<A-w>", "<Cmd>BufferClose<CR>")
set("n", "<A-W>", "<Cmd>BufferCloseAllButCurrentOrPinned<CR>")

-- LSP
set("n", "<leader>lc", vim.lsp.buf.rename)
set("n", "<leader>la", vim.lsp.buf.code_action)
set("n", "<leader>lt", vim.lsp.buf.type_definition)
set("n", "<leader>ls", telescope_builtin.lsp_document_symbols)
set("n", "<leader>lf", function() require("conform").format({ async = true, lsp_fallback = true }) end)

set("n", "<leader>ld", vim.lsp.buf.definition)
set("n", "<leader>lr", telescope_builtin.lsp_references)
set("n", "<leader>ll", telescope_builtin.diagnostics)
set("n", "<leader>li", vim.lsp.buf.implementation)
set("n", "<leader>lk", function()
    vim.lsp.buf.hover()
    vim.lsp.buf.hover()
end)
set("n", "<leader>lD", vim.lsp.buf.declaration)

-- neogen
local neogen = require("neogen")

set("n", "<leader>lg", neogen.generate)

-- ufo
local ufo = require("ufo")
vim.keymap.set("n", "zR", ufo.openAllFolds)
vim.keymap.set("n", "zM", ufo.closeAllFolds)

-- nvim-dap
local dap = require("dap")
local dapui = require("dapui")

set("n", "<C-d>", dapui.toggle)
set("n", "<leader>db", dap.toggle_breakpoint)
set("n", "<leader>dc", function() dap.toggle_breakpoint(vim.fn.input("Set Condition: ")) end)
set("n", "<S-CR>", dap.step_into)
set("n", "<CR>", dap.step_over)
set("n", "<leader>dr", function() dap.continue() end)
set("n", "<leader>dt", function()
    dap.terminate()
    dapui.close()
end)

-- cmake-tools
set("n", "<leader>cmd", "<cmd>CMakeDebug<CR>")
set("n", "<leader>cmg", "<cmd>CMakeGenerate<CR>")
set("n", "<leader>cmb", "<cmd>CMakeBuild<CR>")
set("n", "<leader>cmr", "<cmd>CMakeRun<CR>")
set("n", "<leader>cmc", "<cmd>CMakeClean<CR>")
set("n", "<leader>cmtr", "<cmd>CMakeSelectLaunchTarget<CR>")
set("n", "<leader>cmtt", "<cmd>CMakeRunTest<CR>")
set("n", "<C-c>", "<cmd>ClangdSwitchSourceHeader<CR>")

-- GitSigns
local gitsigns = require("gitsigns")

set("n", "<leader>ghr", gitsigns.reset_hunk)
set("n", "<leader>ghR", gitsigns.reset_buffer)
set("n", "<leader>ghs", gitsigns.stage_hunk)
set("n", "<leader>ghS", gitsigns.stage_buffer)
set("n", "<leader>gb", telescope_builtin.git_branches)
set("n", "<leader>gB", gitsigns.toggle_current_line_blame)
set("n", "<leader>ghp", gitsigns.preview_hunk)
set("n", "<leader>gt", gitsigns.preview_hunk_inline)
set("n", "<leader>g]", function() gitsigns.nav_hunk("next") end)
set("n", "<leader>g[", function() gitsigns.nav_hunk("prev") end)

-- Fugitive
set("n", "<leader>gP", "<cmd>Git pull origin<CR>")
set("n", "<leader>gps", "<cmd>Git stash<CR>")
set("n", "<leader>gpp", "<cmd>Git stash pop<CR>")

-- Peepsight
local peepsight = require("peepsight")

set("n", "<leader>p", peepsight.toggle)

-- auto-session
set("n", "<leader>ql", "<Cmd>SessionRestore<CR>")
