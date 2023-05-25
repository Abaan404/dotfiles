#!/bin/bash

FILENAME=~/Pictures/screenshots/$(date +'%Y%m%d-%H%M%S_screenshot.png')

if [[ $1 = "region" ]]; then
    slurp -b 111111AA -c 111111AA | grim -g - $FILENAME
elif [[ $1 == "window" ]]; then
    grim -g "$(hyprctl -j activewindow | jq -r '"\(.at[0]),\(.at[1]) \(.size[0])x\(.size[1])"')" $FILENAME
elif [[ $1 == "screen" ]]; then
    grim -g "$(hyprctl -j monitors | jq -r '.[] | "\(.x),\(.y) \(.width)x\(.height)"')" $FILENAME
fi

notify-send "Screenshot $1 Captured" -i $FILENAME
wl-copy < $FILENAME
