{ pkgs, ... }:

{
  home.packages = [
    # launch a python3 shell
    (pkgs.writeShellScriptBin "py" ''
      nix-shell -p "python3.withPackages (pypkgs: with pypkgs; [ $* ])" --command python3
    '')

    # screenshots
    (pkgs.writeShellScriptBin "screenshot" ''
      FILENAME=~/Pictures/screenshots/$(date +'%Y%m%d-%H%M%S_screenshot.png')
      mkdir -p ~/Pictures/screenshots

      # grab res
      if [[ $1 == "region" ]]; then
          if ! size=$(slurp -b 111111AA -c 111111AA); then
              exit 1
          fi

      elif [[ $1 == "window" ]]; then
          size=$(hyprctl -j activewindow | jq -r '"\(.at[0]),\(.at[1]) \(.size[0])x\(.size[1])"')
      elif [[ $1 == "screen" ]]; then
          size=$(hyprctl -j monitors | jq -r '.[] | "\(.x),\(.y) \(.width)x\(.height)"')
      fi

      # capture screen
      grim -g "$size" "$FILENAME"

      # dropshadow
      # convert $FILENAME \( +clone -background black -shadow 75x10+0+0 \) +swap -background none -layers merge +repage $FILENAME

      # copy to clipboard
      wl-copy < "$FILENAME"

      action=$(notify-send "Screenshot Captured" --app-name="Screenshot" --action=edit=edit --hint=string:image-path:"$FILENAME")
      if [[ $action == "edit" ]]; then
          swappy -f "$FILENAME"
      fi
    '')

    # nowplaying (for hyprlock)
    (pkgs.writeShellScriptBin "nowplaying" ''
      status=$(playerctl status 2>/dev/null)

      # early exit
      if [[ "$status" == "No players found" ]]; then
          nowplaying="Nothing is playing right now."
          exit
      fi

      player=$(playerctl --list-all | head -n 1)

      # for each player
      if [[ "$player" == "spotify" ]]; then 
          nowplaying="$(playerctl --player spotify metadata --format "  {{xesam:artist}} - {{xesam:title}}")"
      elif [[ "$player" == "firefox" ]]; then 
          nowplaying="$(playerctl --player firefox metadata --format "  {{xesam:title}}")"
      else
          nowplaying="$(playerctl metadata --format "  {{xesam:title}} - {{xesam:title}}")"
      fi

      # truncate
      size=$(printf "%s" "$nowplaying" | wc -m)
      if [[ -n "$1" && $size -gt "$1" ]]; then
          nowplaying="$(printf "%s" "$nowplaying" | awk -v len="$1" '{print substr($0, 1, len)}')..."
      fi

      echo "$nowplaying"
    '')

    # spawn a color picker
    (pkgs.writeShellScriptBin "colorpicker" ''
      color=$(hyprpicker)

      if [[ -z "$color" ]]; then
          exit 1
      fi

      magick -size 64x64 xc:"$color" /tmp/colorpicker.png
      echo "$color" | wl-copy

      notify-send "$color" "Saved to clipboard" --hint=string:image-path:/tmp/colorpicker.png
    '')
  ];
}
