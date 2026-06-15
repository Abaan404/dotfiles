local function bind(tbl, opts, _modifier)
    opts = opts or {}
    for k, v in pairs(tbl) do
        local combo = _modifier and (_modifier .. " + " .. k) or k

        if type(v) == "table" then
            bind(v, opts, combo)
        else
            hl.bind(combo, v, opts)
        end
    end
end

-- application binds
bind({
    ["SUPER"] = {
        ["F1"] = hl.dsp.exec_cmd("zen-twilight"),
        ["F2"] = hl.dsp.exec_cmd("kitty nvim"),
        ["F3"] = hl.dsp.exec_cmd("vesktop"),
        ["F4"] = hl.dsp.exec_cmd("spotify"),
        ["F5"] = hl.dsp.exec_cmd("prismlauncher"),
        ["E"] = hl.dsp.exec_cmd("dolphin"),
        ["return"] = hl.dsp.exec_cmd("kitty"),
        ["T"] = hl.dsp.exec_cmd("pypr toggle term"),
        ["P"] = hl.dsp.exec_cmd("colorpicker"),
    },
})

-- rofi binds
bind({
    ["SUPER"] = {
        ["SUPER_L"] = hl.dsp.exec_cmd("pkill rofi || rofi -show drun"),
        ["Q"] = hl.dsp.exec_cmd("pkill rofi || rofi -show calc -modi calc -no-show-match -no-sort -calc-command \"echo -n '{result}' | wl-copy\""),
    },
}, { on_release = true })

-- window binds
bind({
    ["SUPER"] = {
        ["R"] = hl.dsp.window.float(),
        ["C"] = hl.dsp.window.close(),
        ["F"] = hl.dsp.window.fullscreen({ mode = "maximized" }),

        ["A"] = hl.dsp.focus({ direction = "l" }),
        ["D"] = hl.dsp.focus({ direction = "r" }),
        ["W"] = hl.dsp.focus({ direction = "u" }),
        ["S"] = hl.dsp.focus({ direction = "d" }),
        ["LEFT"] = hl.dsp.focus({ direction = "l" }),
        ["RIGHT"] = hl.dsp.focus({ direction = "r" }),
        ["UP"] = hl.dsp.focus({ direction = "u" }),
        ["DOWN"] = hl.dsp.focus({ direction = "d" }),

        ["SHIFT"] = {
            ["P"] = hl.dsp.window.pin(),
            ["C"] = hl.dsp.exec_cmd("kill $(hyprctl activewindow -j | jq -r '.pid')"),
            ["F"] = hl.dsp.window.fullscreen({ mode = "fullscreen" }),

            ["1"] = hl.dsp.window.move({ workspace = 1 }),
            ["2"] = hl.dsp.window.move({ workspace = 2 }),
            ["3"] = hl.dsp.window.move({ workspace = 3 }),
            ["4"] = hl.dsp.window.move({ workspace = 4 }),
            ["5"] = hl.dsp.window.move({ workspace = 5 }),
            ["6"] = hl.dsp.window.move({ workspace = 6 }),
            ["7"] = hl.dsp.window.move({ workspace = 7 }),
            ["8"] = hl.dsp.window.move({ workspace = 8 }),
            ["9"] = hl.dsp.window.move({ workspace = 9 }),
            ["0"] = hl.dsp.window.move({ workspace = 10 }),

            ["A"] = hl.dsp.window.swap({ direction = "l" }),
            ["D"] = hl.dsp.window.swap({ direction = "r" }),
            ["W"] = hl.dsp.window.swap({ direction = "u" }),
            ["S"] = hl.dsp.window.swap({ direction = "d" }),
        },
    },
})

-- window resizing
bind({
    ["SUPER"] = {
        ["SHIFT"] = {
            ["LEFT"] = hl.dsp.window.resize({ x = -50, y = 0, relative = true }),
            ["RIGHT"] = hl.dsp.window.resize({ x = 50, y = 0, relative = true }),
            ["UP"] = hl.dsp.window.resize({ x = 0, y = -50, relative = true }),
            ["DOWN"] = hl.dsp.window.resize({ x = 0, y = 50, relative = true }),
        },
    },
}, { repeating = true })

-- mouse binds
bind({
    ["SUPER"] = {
        ["mouse:273"] = hl.dsp.window.resize(),
        ["mouse:272"] = hl.dsp.window.drag(),
    },
}, { mouse = true })

-- workspace binds
bind({
    ["SUPER"] = {
        ["1"] = hl.dsp.focus({ workspace = 1 }),
        ["2"] = hl.dsp.focus({ workspace = 2 }),
        ["3"] = hl.dsp.focus({ workspace = 3 }),
        ["4"] = hl.dsp.focus({ workspace = 4 }),
        ["5"] = hl.dsp.focus({ workspace = 5 }),
        ["6"] = hl.dsp.focus({ workspace = 6 }),
        ["7"] = hl.dsp.focus({ workspace = 7 }),
        ["8"] = hl.dsp.focus({ workspace = 8 }),
        ["9"] = hl.dsp.focus({ workspace = 9 }),
        ["0"] = hl.dsp.focus({ workspace = 10 }),
    },
})

-- syskeys
bind({
    ["XF86AudioPlay"] = hl.dsp.exec_cmd("playerctl play-pause"),
    ["XF86AudioStop"] = hl.dsp.exec_cmd("playerctl stop"),
    ["XF86AudioPrev"] = hl.dsp.exec_cmd("playerctl previous"),
    ["XF86AudioNext"] = hl.dsp.exec_cmd("playerctl next"),
    ["XF86AudioMute"] = hl.dsp.exec_cmd("wpctl set-mute @DEFAULT_AUDIO_SINK@ toggle"),
    ["XF86AudioMicMute"] = hl.dsp.exec_cmd("wpctl set-mute @DEFAULT_AUDIO_SOURCE@ toggle"),
}, { locked = true })

bind({
    ["XF86AudioLowerVolume"] = hl.dsp.exec_cmd("wpctl set-volume -l 1.0 @DEFAULT_AUDIO_SINK@ 10%-"),
    ["XF86AudioRaiseVolume"] = hl.dsp.exec_cmd("wpctl set-volume -l 1.0 @DEFAULT_AUDIO_SINK@ 10%+"),
    ["XF86MonBrightnessDown"] = hl.dsp.exec_cmd("brightnessctl set 10%-"),
    ["XF86MonBrightnessUp"] = hl.dsp.exec_cmd("brightnessctl set 10%+"),
}, { repeating = true, locked = true })

-- Screenshot binds
bind({
    ["SUPER"] = {
        ["SHIFT"] = {
            ["Z"] = hl.dsp.exec_cmd("screenshot window"),
            ["X"] = hl.dsp.exec_cmd("screenshot region"),
        },
    },
    ["PRINT"] = hl.dsp.exec_cmd("screenshot screen"),
})

-- Misc binds
bind({
    ["SUPER"] = {
        ["M"] = hl.dsp.exec_cmd('ags request "window powermenu"'),
        ["G"] = hl.dsp.exec_cmd('ags request "window replaymenu"'),
        ["L"] = hl.dsp.exec_cmd("loginctl lock-session"),
        ["H"] = hl.dsp.exec_cmd("switch-theme"),
        ["GRAVE"] = hl.dsp.exec_cmd("wpctl set-mute @DEFAULT_AUDIO_SOURCE@ toggle"),
        ["SHIFT"] = {
            ["Q"] = hl.dsp.exit(),
        },
    },
})

-- Global
bind({
    ["CTRL"] = {
        ["F9"] = hl.dsp.pass({ window = "class:com.obsproject.Studio" }),
    },
})
