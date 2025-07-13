<h2 align="center">Hyprland w/ pywal</h2>

<div align="center">
    <p>Now with unlimited color themes!</p>
    <img src="screenshots/1.png"></img>
    <img src="screenshots/2.png"></img>
    <img src="screenshots/3.png"></img>
</div>

> For a showcase video see [here](https://www.youtube.com/watch?v=nNvciN4sGKQ).

### Installation

1. Grab a [NixOS ISO](https://nixos.org/download/) iso and create a minimal install.

2. Clone the repository and run the install script.

```bash
nix-shell -p git just home-manager

git clone https://github.com/abaan404/dotfiles ~/.dotfiles
cd ~/.dotfiles

just install <YOURSYSTEMNAME>

# run hyprland through the tty
Hyprland
```

_Note: if something went wrong, run `git reset --hard origin/main` to revert to a base state, this will erase any changes made in ~/.dotfiles (but you can get it back from `git reflog`)_

3. Add a `.env` file with the following entries for weather and unsplash support.

```sh
OPENWEATHER_API_KEY= # https://openweathermap.org/api
OPENWEATHER_LOCATION= # https://openweathermap.org/city
UNSPLASH_ACCESS_KEY= # https://unsplash.com/developers
```

4. Change any configs to your liking (i.e. username, git, etc).

5. Reboot (if needed) and simply run `Hyprland` from the tty.

### Notes

-   Switch theme with SUPER + H, see `./config/hypr/keybinds.conf` for all keybinds.
-   while nix is meant to manage your configs, `~/.dotfiles/nix/switch-theme/switch-theme.py` will also manage them by copying `~/.dotfiles/config` into `~/.config` while it overwrites certain keys for theming purposes.
-   The wallpaper path (`~/Pictures/wallpapers/`) and pywal backend (`colorthief`) can be modified within the `./nix/switch-theme/switch-theme.py` file.
-   The way this repo is setup, it expects that you have this repo cloned in `~/.dotfiles` exactly as is and with your `.env` variables defined in the same directory.

### Credits and Acknowledgements

-   [end-4/dots-hyprland](https://github.com/end-4/dots-hyprland)'s wonderful dots and [dharmax](https://dharmx.is-a.dev/eww-powermenu/)'s guide to get me started on eww.
-   Kvantum Theme (modified with pywal) by [vinceliuice/Layan-kde](https://github.com/vinceliuice/Layan-kde).
-   my sanity for keeping up with me (it didnt).
