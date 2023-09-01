return {
    {
        "heavenshell/vim-pydocstring",
        ft = "python",
        build = "make install",
        config = function()
            vim.g.pydocstring_formatter = "google"
        end
    }
}
