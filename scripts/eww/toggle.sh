#!/usr/bin/bash

tg=$(eww get tg_$1)
if [[ "$tg" == "true" || "$1" == "kill" ]]; then
    eww close $1
    eww update tg_"$1"=false
else
    eww open $1
    eww update tg_"$1"=true
fi
