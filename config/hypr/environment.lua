hl.on("hyprland.start", function()
    hl.exec_cmd("systemctl --user start hyprpolkitagent")
    hl.exec_cmd("awww-daemon")
    hl.exec_cmd("awww clear 111111")
    hl.exec_cmd("hypridle")
    hl.exec_cmd("iio-hyprland")
    hl.exec_cmd("pypr")
    hl.exec_cmd("playerctld daemon")
    hl.exec_cmd("switch-theme")
end)

hl.monitor({ output = "", mode = "preferred", position = "auto", scale = 1 })

hl.config({
    general = {
        gaps_in = 5,
        gaps_out = 10,
        border_size = 5,
        col = {
            active_border = { colors = { "rgba(!!{colors_color5}ee)", "rgba(!!{colors_color6}ee)", "rgba(!!{colors_color7}ee)", angle = 45 } },
            nogroup_border_active = { colors = { "rgba(!!{colors_color5}ee)", "rgba(!!{colors_color6}ee)", "rgba(!!{colors_color7}ee)", angle = 45 } },
            inactive_border = "rgba(595959aa)",
            nogroup_border = "rgba(595959aa)",
        },
        no_focus_fallback = true,
        resize_on_border = true,
        layout = "dwindle",
    },
    decoration = {
        rounding = 5,
        blur = {
            size = 10,
            passes = 3,
        },
    },
    input = {
        follow_mouse = 1,
        sensitivity = 0,
        touchpad = {
            disable_while_typing = false,
            natural_scroll = true,
        },
    },
    dwindle = {
        preserve_split = true,
    },
    gestures = {
        workspace_swipe_touch = true,
        workspace_swipe_cancel_ratio = 0.1,
        workspace_swipe_forever = true,
    },
    binds = {
        focus_preferred_method = 0, -- doesnt work on fullscreen
    },
    misc = {
        disable_hyprland_logo = true, -- im sorry :(
        disable_splash_rendering = true,
        disable_autoreload = true,
        enable_anr_dialog = false,
    },
})
