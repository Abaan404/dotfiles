#!/usr/bin/env bash

color=$(hyprpicker)

if [[ -z "$color" ]]; then
  exit 1
fi

convert -size 64x64 xc:"$color" /tmp/colorpicker.png
echo "$color" | wl-copy

notify-send "$color" "Saved to clipboard" --hint=string:image-path:/tmp/colorpicker.png
