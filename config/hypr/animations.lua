hl.curve("easeOutBack", { type = "bezier", points = { { 0.34, 1.3 }, { 0.64, 1 } } })
hl.curve("easeOutExpo", { type = "bezier", points = { { 0.16, 1 }, { 0.3, 1 } } })
hl.curve("linear", { type = "bezier", points = { { 0, 0 }, { 1, 1 } } })

hl.animation({ leaf = "windowsOut", enabled = true, speed = 3, bezier = "easeOutExpo", style = "popin 80%" })
hl.animation({ leaf = "workspaces", enabled = true, speed = 6, bezier = "easeOutExpo", style = "slide" })
hl.animation({ leaf = "windows", enabled = true, speed = 4, bezier = "easeOutBack", style = "slide" })
hl.animation({ leaf = "border", enabled = true, speed = 1, bezier = "linear" })
hl.animation({ leaf = "borderangle", enabled = true, speed = 30, bezier = "linear", style = "loop" })
