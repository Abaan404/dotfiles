#!/usr/bin/python3

# i tried ok

import subprocess, sys, os
import dotenv
import requests
import pywal

from PIL import Image
from string import Template
from pathlib import Path

dotenv.load_dotenv()

CONFIG = {
    "config_template_path": Path("~/.dotfiles/config").expanduser(),
    "config_path": Path("~/.config").expanduser(),

    "wallpaper_folder": Path("~/Pictures/wallpapers").expanduser(),
    "wallpaper_type": "iterative", # unsplash, random, or iterative (Unsplash can be really slow)
    "unsplash_query": "mountain",

    "backend": "colorthief" # ensure the package for the backend is installed
}

class CustomTemplate(Template):
	delimiter = '!!'

class TemplateWriter:
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
        self.write(CONFIG["config_template_path"], CONFIG["config_path"])

        # run post-reload scripts
        for template in CONFIG["config_template_path"].iterdir():
            getattr(self, template.name.lower(), lambda: None)()

    def ags(self):
        subprocess.Popen(["killall", "ags"])
        color = tuple(int((self.mappings["text"] + "FF")[i : i + 2], 16) for i in (0, 2, 4, 6))
        path = CONFIG["config_path"].joinpath("ags/images/")
        path.mkdir(exist_ok=True)

        # change all non-transparent colors in the image to "color"
        for file in [
            Path("~/.dotfiles/images/launcher.png"),
            Path("~/.dotfiles/images/playerart-default.png")
        ]:
            img = Image.open(file.expanduser()).convert("RGBA")
            img.putdata([color if pixel[3] != 0 else pixel for pixel in img.getdata()]) # pyright: ignore ignoreGeneralTypeIssues
            img.save(path.joinpath(file.name))

        subprocess.Popen(["ags"])

    def eww(self):
        color = tuple(int((self.mappings["text"] + "FF")[i : i + 2], 16) for i in (0, 2, 4, 6))
        path = CONFIG["config_path"].joinpath("eww/images/")
        path.mkdir(exist_ok=True)

        # change all non-transparent colors in the image to "color"
        for file in [
            Path("~/.dotfiles/images/launcher.png"),
            Path("~/.dotfiles/images/playerart-default.png")
        ]:
            img = Image.open(file.expanduser()).convert("RGBA")
            img.putdata([color if pixel[3] != 0 else pixel for pixel in img.getdata()]) # pyright: ignore ignoreGeneralTypeIssues
            img.save(path.joinpath(file.name))

    def swaylock(self):
        subprocess.Popen(["killall", "swayidle"])
        subprocess.Popen(["swayidle"])

    def hypr(self):
        if subprocess.run(["pidof", "obs"], check=False, stdout=subprocess.PIPE).stdout: # hyprland crashes if configs get updated while obs is running
            return
        subprocess.Popen(["hyprctl", "reload"])

    def dunst(self):
        subprocess.Popen(["killall", "dunst"])
        subprocess.Popen(["dunst"])

    def kvantum(self):
        # qt
        subprocess.Popen(["kvantummanager", "--set", "Layan-pywal"])

        # gtk
        oomox = Path("~/.cache/wal/colors-oomox").expanduser()
        configs = "\n".join([
            f"FG={self.mappings['text']}",
            f"SEL_FG={self.mappings['text']}",
            "SPACING=2",
            "ROUNDNESS=5",
            "BTN_OUTLINE_WIDTH=1",
            "BTN_OUTLINE_OFFSET=-3"
        ])

        with open(oomox, "a") as f:
            f.write(configs)

        subprocess.Popen(["/opt/oomox/plugins/theme_oomox/change_color.sh", oomox])

    def rofi(self):
        # a 512x512 image centered on the wallpaper
        img = Image.open(self.mappings["wallpaper"])
        box = (
            *((ax - 512) // 2 for ax in img.size),
            *((ax + 512) // 2 for ax in img.size))
        img.crop(box).save(CONFIG["config_path"].joinpath("rofi/image.png"))


def unsplash(query):
    headers={ "Authorization": f"Client-ID {os.getenv('UNSPLASH_ACCESS_KEY')}" }
    with requests.get(f"https://api.unsplash.com/photos/random?orientation=landscape&query={query}", headers=headers) as r:
        match r.status_code:
            case 200:
                data = r.json()
            case 429:
                print(f"Rate Limit Exceeded, reverting to random image from {CONFIG['wallpaper_folder']}")
                return pywal.image.get(CONFIG["wallpaper_folder"], iterative=False)
            case _:
                print(f"Unknown Error: {r.content}", file=sys.stderr)
                return

        if int(r.headers["X-Ratelimit-Remaining"]) / int(r.headers["X-Ratelimit-Limit"]) < 0.10:
            subprocess.Popen(["notify-send", f"{r.headers['X-Ratelimit-Remaining']} request(s) remaining"])

    subprocess.Popen(["notify-send", f'{data["description"] or "No Description"}', f'By {data["user"]["name"]}'])
    with requests.get(data["urls"]["raw"]) as r:
        img = r.content

    unsplash_path = CONFIG["wallpaper_folder"].joinpath("unsplash.png")
    with open(unsplash_path, "wb") as f:
        f.write(img)

    return str(unsplash_path)

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
        wallpaper = pywal.image.get(str(Path(sys.argv[1]).absolute()))

    elif CONFIG["wallpaper_type"] == "random":
        wallpaper = pywal.image.get(CONFIG["wallpaper_folder"])

    elif CONFIG["wallpaper_type"] == "iterative":
        wallpaper = pywal.image.get(CONFIG["wallpaper_folder"], iterative=True)

    elif CONFIG["wallpaper_type"] == "unsplash":
        # dont cache color scheme
        pywal.colors.cache_fname = lambda *_: ["/dev", "null"]
        wallpaper = pywal.image.get(unsplash(CONFIG["unsplash_query"]))

    else:
        print("Invalid wallpaper type", file=sys.stderr)
        exit(1)

    subprocess.Popen(["swww", "img", wallpaper, "--transition-type=grow", "--transition-fps=120", "--transition-pos=top-right"])

    # use pywal to get colors
    colors = pywal.colors.get(wallpaper, backend=CONFIG["backend"])
    pywal.export.every(colors)

    # load all colors from pywal (and remove the # symbol before each color)
    colors = flatten_dict(colors)
    colors.update({k: v[1:] for k, v in colors.items() if v.startswith("#")})

    TemplateWriter({
        # dirs
        "HOME": str(Path("~").expanduser()),
        "wallpaper": wallpaper,

        # colors
        **colors,
        "primary": colors["colors_color3"],
        "secondary": colors["colors_color2"],
        "accent": colors["colors_color5"],
        "bad": "cc4f4f",
        "good": "26a65b",
        "warning": "d3980f",
        "text": "d2d2d2",

        # misc
        "bluetooth": "0a3b8c",
    }).reload()
