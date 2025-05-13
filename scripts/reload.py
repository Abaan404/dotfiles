#!/usr/bin/env python3

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
    "wallpaper_type": "iterative",  # unsplash, random, or iterative (Unsplash can be really slow)
    "unsplash_query": "mountain",
    "backend": "colorthief",  # ensure the package for the backend is installed
}


class CustomTemplate(Template):
    delimiter = "!!"


class TemplateWriter:
    def __init__(self, mappings: dict) -> None:
        self.mappings = mappings

    def write(self, template_path: Path, config_path: Path):
        for conf in template_path.iterdir():
            # some js packages uses "!!" somewhere for some reason,
            # instead of changing delimiter just ignore the path
            # entirely
            if conf.name in ["@girs", "node_modules"]:
                continue

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
                f.write(stream)

    def reload(self):
        self.write(CONFIG["config_template_path"], CONFIG["config_path"])

        color = tuple(int((self.mappings["text"] + "FF")[i : i + 2], 16) for i in (0, 2, 4, 6))
        path = CONFIG["config_path"].joinpath("ags/assets/")
        path.mkdir(exist_ok=True)

        # rofi
        img = Image.open(self.mappings["wallpaper"])
        box = (*((ax - 512) // 2 for ax in img.size), *((ax + 512) // 2 for ax in img.size))
        img.crop(box).save(CONFIG["config_path"].joinpath("rofi/image.png"))  # pyright: ignore

        # hyprland
        subprocess.Popen(["hyprctl", "reload"])

        # qt theme
        subprocess.Popen(["kvantummanager", "--set", "Layan-pywal"])

        # ags/astal
        for file in [
            Path("~/.dotfiles/assets/playerart.png").expanduser(),
        ]:
            img = Image.open(file).convert("RGBA")
            img.putdata([color if pixel[3] != 0 else pixel for pixel in img.getdata()])  # pyright: ignore ignoreGeneralTypeIssues
            img.save(path.joinpath(file.name))

        subprocess.run(["ags", "quit"])
        subprocess.Popen(["ags", "run", "--gtk4"], env=os.environ.copy())

        # wvkbd
        subprocess.run(["killall", "wvkbd-abaan404"])
        subprocess.Popen(
            [
                "wvkbd-abaan404",
                "-L",
                "350",
                "-bg",
                f"{self.mappings["colors_color1"]}11",
                "-fg",
                f"{self.mappings["accent"]}55",
                "-fg-sp",
                f"{self.mappings["primary"]}66",
                "-press",
                f"{self.mappings["accent"]}",
                "-press-sp",
                f"{self.mappings["accent"]}",
                "-text",
                f"{self.mappings["text"]}",
                "-text-sp",
                f"{self.mappings["text"]}",
                "-swipe",
                f"{self.mappings["accent"]}",
                "-swipe-sp",
                f"{self.mappings["accent"]}",
                "-O",
                "--hidden",
            ]
        )


def unsplash(query):
    headers = {"Authorization": f"Client-ID {os.getenv('UNSPLASH_ACCESS_KEY')}"}
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
def flatten_dict(dictionary: dict, parent_key: str = "", separator: str = "_"):
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

    TemplateWriter(
        {
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
        }
    ).reload()
