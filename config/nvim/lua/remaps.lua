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

-- NvimTree
local nvimtree = require("nvim-tree.api")

set("n", "<C-n>", function() nvimtree.tree.toggle({ focus = false }) end)
set("n", "<leader>e", nvimtree.tree.focus)

-- Telescope
local telescope_builtin = require("telescope.builtin")

set("n", "<leader>ff", telescope_builtin.find_files)
set("n", "<leader>fa", function() telescope_builtin.find_files({ follow = true, no_ignore = true, hidden = true }) end)
set("n", "<leader>fw", telescope_builtin.live_grep)
set("n", "<leader>fb", telescope_builtin.buffers)
set("n", "<leader>fh", telescope_builtin.help_tags)
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
local nvterm = require("nvterm.terminal")

set({ "n", "t", "v", "i" }, "<A-t>", function() nvterm.toggle("horizontal") end)
set({ "n", "t", "v", "i" }, "<A-f>", function() nvterm.toggle("floating") end)

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
set("n", "<leader>M", "<cmd>Mason<cr>")

set("n", "<leader>lc", vim.lsp.buf.rename)
set("n", "<leader>la", vim.lsp.buf.code_action)
set("n", "<leader>lt", vim.lsp.buf.type_definition)
set("n", "<leader>ls", telescope_builtin.lsp_document_symbols)
set("n", "<leader>lf", vim.lsp.buf.format)

set("n", "<leader>ld", vim.lsp.buf.definition)
set("n", "<leader>lr", telescope_builtin.lsp_references)
set("n", "<leader>ll", telescope_builtin.diagnostics)
set("n", "<leader>li", vim.lsp.buf.implementation)
set("n", "<leader>lk", vim.lsp.buf.hover)
set("n", "<leader>lD", vim.lsp.buf.declaration)

-- neogen
local neogen = require("neogen")

set("n", "<leader>lg", neogen.generate)

-- nvim-dap
local dap = require("dap")
local dapui = require("dapui")

set("n", "<leader>dd", dapui.toggle)
set("n", "<leader>db", dap.toggle_breakpoint)
set("n", "<leader>dr", dap.continue)
set("n", "<leader>dt", dap.terminate)
set("n", "m", dap.step_over)
set("n", "<leader>di", dap.step_into)

-- GitSigns
local gitsigns = require("gitsigns")

set("n", "<leader>ghr", gitsigns.reset_hunk)
set("n", "<leader>ghR", gitsigns.reset_buffer)
set("n", "<leader>ghs", gitsigns.stage_hunk)
set("n", "<leader>ghS", gitsigns.stage_buffer)
set("n", "<leader>gb", telescope_builtin.git_branches)
set("n", "<leader>gB", gitsigns.toggle_current_line_blame)
set("n", "<leader>ghp", gitsigns.preview_hunk)
set("n", "<leader>ghu", gitsigns.undo_stage_hunk)
set("n", "<leader>gt", gitsigns.toggle_deleted)
set("n", "<leader>g]", gitsigns.next_hunk)
set("n", "<leader>g[", gitsigns.prev_hunk)

-- Peepsight
local peepsight = require("peepsight")

set("n", "<leader>p", peepsight.toggle)

-- pydocstring
set("n", "<leader>p/", "<cmd>Pydocstring<CR>")

-- Persistence
local persistence = require("persistence")
set("n", "<leader>ql", persistence.load)
