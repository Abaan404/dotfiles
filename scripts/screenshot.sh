#!/bin/bash

FILENAME=~/Pictures/screenshots/$(date +'%Y%m%d-%H%M%S_screenshot.png')

# grab res
if [[ $1 = "region" ]]; then
    size=$(slurp -b 111111AA -c 111111AA)
elif [[ $1 == "window" ]]; then
    size=$(hyprctl -j activewindow | jq -r '"\(.at[0]),\(.at[1]) \(.size[0])x\(.size[1])"')
elif [[ $1 == "screen" ]]; then
    size=$(hyprctl -j monitors | jq -r '.[] | "\(.x),\(.y) \(.width)x\(.height)"')
fi

# capture screen
grim -g "$size" $FILENAME

# dropshadow
convert $FILENAME \( +clone -background black -shadow 75x10+0+0 \) +swap -background none -layers merge +repage $FILENAME

# copy to clipboard
wl-copy < $FILENAME

# notify
action=$(dunstify --action="swappy,swappy" "Screenshot $1 Captured" -i $FILENAME)
if [[ $action == "swappy" ]]; then
    swappy -f $FILENAME
fi
