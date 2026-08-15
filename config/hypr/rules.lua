-- workspaces: (1 Main) (2 Dev) (3 Games) (4 Media)

-- floating rules
hl.window_rule({ float = true, center = true, match = { class = "vlc" } })
hl.window_rule({ float = true, center = true, match = { class = "qt6ct" } })
hl.window_rule({ float = true, center = true, match = { class = "lutris" } })
hl.window_rule({ float = true, center = true, match = { class = "zenity" } })
hl.window_rule({ float = true, center = true, match = { class = "swayimg" } })
hl.window_rule({ float = true, center = true, match = { class = "nwg-look" } })
hl.window_rule({ float = true, center = true, match = { class = "pavucontrol" } })
hl.window_rule({ float = true, center = true, match = { class = "kvantummanager" } })
hl.window_rule({ float = true, center = true, match = { class = "blueman-manager" } })
hl.window_rule({ float = true, center = true, match = { class = "org.kde.kate" } })
hl.window_rule({ float = true, center = true, match = { class = "org.kde.dolphin" } })
hl.window_rule({ float = true, center = true, match = { class = "org.kde.polkit-kde-authentication-agent-1" } })
hl.window_rule({ float = true, center = true, match = { class = "org.prismlauncher.PrismLauncher" } })
hl.window_rule({ float = true, center = true, match = { title = "Picture-in-Picture" } })
hl.window_rule({ float = true, center = true, match = { title = "DevTools" } })
hl.window_rule({ float = true, center = true, match = { title = "gjs" } })
hl.window_rule({ float = true, center = true, match = { title = "octave-gui" } })

hl.window_rule({ size = { "(monitor_w*0.6)", "(monitor_h*0.6)" }, match = { class = "swayimg" } })
hl.window_rule({ size = { "(monitor_w*0.6)", "(monitor_h*0.6)" }, match = { class = "octave-gui" } })
hl.window_rule({ size = { "(monitor_w*0.8)", "(monitor_h*0.6)" }, match = { class = "org.kde.dolphin" } })
hl.window_rule({ move = { "(monitor_w*0.692)", "(monitor_h*0.046)" }, size = { "(monitor_w*0.3)", "(monitor_h*0.3)" }, match = { title = "Picture-in-Picture" } })

hl.window_rule({ pin = true, match = { title = "Picture-in-Picture" } })

hl.window_rule({ workspace = 3, match = { class = "org.prismlauncher.PrismLauncher" } })
hl.window_rule({ workspace = 3, match = { class = "lutris" } })
hl.window_rule({ workspace = 4, match = { class = "spotify" } })
hl.window_rule({ workspace = 4, match = { class = "(vesktop|discord)" } })
hl.window_rule({ workspace = 5, fullscreen = true, match = { class = "wlroots" } })

-- # fix blurs
hl.layer_rule({ blur = false, match = { namespace = "gtk4-layer-shell" } })
hl.layer_rule({ blur = true, match = { class = "wvkbd" } })
hl.layer_rule({ ignore_alpha = 0, match = { class = "wvkbd" } })

-- # misc
hl.window_rule({ float = true, center = true, match = { title = "Physbuzz Game" } })
hl.window_rule({ workspace = 3, match = { title = "Physbuzz Game" } })

hl.window_rule({
    -- Ignore maximize requests from all apps. You'll probably like this.
    name = "suppress-maximize-events",
    match = { class = ".*" },

    suppress_event = "maximize",
})

hl.window_rule({
    -- Fix some dragging issues with XWayland
    name = "fix-xwayland-drags",
    match = {
        class = "^$",
        title = "^$",
        xwayland = true,
        float = true,
        fullscreen = false,
        pin = false,
    },

    no_focus = true,
})

-- persistent workspaces
hl.workspace_rule({ workspace = "r[1-4]", persistent = true })
