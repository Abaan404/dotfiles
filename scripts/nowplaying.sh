#!/usr/bin/env bash

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
    nowplaying="$(playerctl --player spotify metadata --format "  {{xesam:title}}")"
else
    nowplaying="$(playerctl metadata --format "  {{xesam:title}} - {{xesam:title}}")"
fi

# truncate
if [ -n "$1" ] && [ ${#nowplaying} -gt "$1" ]; then
    nowplaying="${nowplaying:0:$1}..."
fi

echo "$nowplaying"
