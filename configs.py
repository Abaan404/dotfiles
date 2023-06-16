#!/usr/bin/python3

# i tried ok

import subprocess, sys
import random
import pywal, wpgtk

from PIL import Image
from string import Template
from pathlib import Path

CONFIG_TEMPLATE_PATH = Path("~/.dotfiles/config").expanduser()
CONFIG_PATH = Path("~/.config").expanduser()
WALLPAPER_FOLDER = Path("~/Pictures/wallpapers/").expanduser()
PYWAL_BACKEND = "colorthief"

class CustomTemplate(Template):
	delimiter = '!!'

class Configs:
    def __init__(self, mappings: dict) -> None:
        self.mappings = mappings

    def write(self, template_path: Path, config_path: Path):
        for conf in template_path.iterdir():
            if conf.is_dir() or not conf.exists():
                config_path.joinpath(conf.name).mkdir(exist_ok=True)
                self.write(template_path.joinpath(conf.name), config_path.joinpath(conf.name))
                continue

            with open(conf, "r") as f:
                try:
                    # use the built-in template module to replace strings
                    stream = CustomTemplate(f.read()).substitute(self.mappings)
                except KeyError as e:
                    print(f"Invalid key {e.args[0]} in {conf}. Skipping...")
                    continue

            with open(config_path.joinpath(conf.name), "w") as f:
                print(f"Writing to path {config_path.joinpath(conf.name)}")
                f.write(stream)


    def reload(self):
        self.write(CONFIG_TEMPLATE_PATH, CONFIG_PATH)

        # run post-reload scripts
        for template in CONFIG_TEMPLATE_PATH.iterdir():
            getattr(self, template.name.lower(), lambda: None)()

    def swaylock(self):
        subprocess.Popen("echo $(killall swayidle) && swayidle", shell=True)

    def hypr(self):
        if subprocess.check_output("echo $(pidof obs)", shell=True).strip(): # hyprland crashes if configs get updated while obs is running
            return
        subprocess.Popen("hyprctl reload", shell=True)

    def waybar(self):
        subprocess.Popen("echo $(killall waybar) && waybar", shell=True)

    def dunst(self):
        subprocess.Popen("echo $(killall dunst) && dunst", shell=True)

    def kvantum(self):
        subprocess.Popen("kvantummanager --set Layan-pywal", shell=True)

    def rofi(self):
        # a 512x512 image centered on the wallpaper
        img = Image.open(self.mappings["wallpaper"])
        box = (
            *((ax - 512) // 2 for ax in img.size),
            *((ax + 512) // 2 for ax in img.size))
        img.crop(box).save(CONFIG_PATH.joinpath("rofi/image.png"))


class Wallpaper:
    def __init__(self, wallpaper_folder: Path) -> None:
        file_types = (".gif", ".jpeg", ".png", ".tga", ".tiff", ".webp", ".bmp", ".jpg")
        try:
            current_wallpaper = str(subprocess.check_output(["swww", "query"])).split('"')[-2]
        except IndexError:
            current_wallpaper = None  # if no wallpaper is set

        self.wallpapers = filter(
            lambda wallpaper: wallpaper.name.endswith(file_types) and wallpaper.name != current_wallpaper,
            wallpaper_folder.iterdir()
        )

    def __set(self, wallpaper: Path):
        subprocess.Popen(["swww", "img", wallpaper,
                "--transition-type=grow",
                "--transition-fps=120",
                "--transition-pos=top-right"])

    def get_random(self):
        wallpaper = random.choice(list(self.wallpapers))
        self.__set(wallpaper)
        return wallpaper


# https://stackoverflow.com/questions/6027558/flatten-nested-dictionaries-compressing-keys
def flatten_dict(dictionary: dict, parent_key: str = '', separator: str = '_'):
    items = []
    for key, value in dictionary.items():
        new_key = parent_key + separator + key if parent_key else key
        if isinstance(value, dict):
            items.extend(flatten_dict(value, new_key, separator=separator).items())
        else:
            items.append((new_key, value))
    return dict(items)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        wallpaper = Path(sys.argv[1]).absolute().expanduser()
    else:
        wallpaper = Wallpaper(WALLPAPER_FOLDER).get_random()

    image = pywal.image.get(str(wallpaper))
    colors = pywal.colors.get(image, backend=PYWAL_BACKEND)
    pywal.export.every(colors)

    # load all colors from pywal (and remove the # symbol before each color)
    colors = flatten_dict(colors)
    colors.update({k: v[1:] for k, v in colors.items() if v.startswith("#")})

    # weird hack to theme gtk and also to ignore it theming terminals
    wpgtk.data.config.settings.setdefault("backend", "colortheif")
    wpgtk.data.themer.pywal.sequences.send = lambda *args, **kwargs: None
    wpgtk.data.themer.set_pywal_theme(str(Path("~/.cache/wal/colors").expanduser()), False)

    Configs({
        # dirs
        "HOME": str(Path("~").expanduser()),
        "wallpaper": str(wallpaper),

        # colors
        **colors,
        "primary": colors["colors_color3"],
        "secondary": colors["colors_color2"],
        "accent": colors["colors_color5"],
        "bad": "cc4f4f",
        "good": "26a65b",
        "text": "d2d2d2",

        # misc
        "bluetooth": "0a3b8c",
    }).reload()
