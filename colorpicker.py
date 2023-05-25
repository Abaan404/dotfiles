#!/usr/bin/python3

import subprocess
from PIL import Image

color = str(subprocess.check_output(['hyprpicker']))[2:-3]
subprocess.Popen(['wl-copy', color.upper()])

if not color:
    exit(-1)

Image.new(mode="RGB", color=color, size=(64, 64)).save("/tmp/colorpicker.png")
subprocess.Popen(['notify-send', f'color ({color.upper()}) saved to clipboard', '-i', '/tmp/colorpicker.png'])
