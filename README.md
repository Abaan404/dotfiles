<h2 align="center">Hyprland w/ pywal</h2>

<div align="center">
    <p>Now with unlimited color themes!</p>
    <img src="screenshots/1.png"></img>
    <img src="screenshots/2.png"></img>
    <img src="screenshots/3.png"></img>
</div>

> For a showcase video see [here](https://streamable.com/wtx50u).

### Installation

1) Build eww with [#809](https://togithub.com/elkowar/eww/pull/809) and [#743](https://togithub.com/elkowar/eww/pull/743) and place the binary into path.

2) Run the install script

```sh
wget https://raw.githubusercontent.com/Abaan404/dotfiles/v2/install.sh && sh install.sh
```
- Its pretty likely this will not work as intended, be advised.

3) Create a `~/.dotfiles/.env` file with the following entries.

```sh
OPENWEATHER_API_KEY= # https://openweathermap.org/api
UNSPLASH_ACCESS_KEY= # https://unsplash.com/developers
```

- The power profile only works for [Lenovo Ideapad Gaming 3 Laptops](https://wiki.archlinux.org/title/Lenovo_IdeaPad_Gaming_3).
- The wallpaper path (`~/Pictures/wallpapers/`) and pywal backend (`colorthief`) can be modified within the `./scripts/reload.py` file

### Usage

- Switch theme with SUPER + H, see `./config/hypr/keybinds.conf` for all keybinds.
- Change weather location by editing the `--location` flag in `./config/eww/eww.yuck`'s weather command.

### Credits and Acknowledgements
- [end-4/dots-hyprland](https://github.com/end-4/dots-hyprland)'s wonderful dots and [dharmax](https://dharmx.is-a.dev/eww-powermenu/)'s guide to get me started on eww.
- Kvantum Theme (modified with pywal) by [vinceliuice/Layan-kde](https://github.com/vinceliuice/Layan-kde).
- my sanity for keeping up with me (it didnt).
