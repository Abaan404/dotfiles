#!/usr/bin/python3

import re
import subprocess, sys, os
import json

from time import sleep

def read_shell(command: list | str, shell: bool = False, ignore_error: bool = False, retry: bool = False, _attempts: int = 0) -> str:
    p = subprocess.run(command, shell=shell, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    if (p.returncode != 0 or p.stderr) and not ignore_error:
        if retry and _attempts < 5:
            sleep(1)
            print(f"Attempt {_attempts}: {p.stderr.decode('utf-8').strip()}", file=sys.stderr)
            return read_shell(command, shell=shell, ignore_error=ignore_error, retry=retry, _attempts = _attempts + 1)
        exit(1)

    return p.stdout.decode("utf-8").strip()

class BaseListener:
    def __init__(self, follower_command: list, follower_pattern: str) -> None:
        self.follower_command = follower_command
        self.follower_pattern = follower_pattern

    def execute(self) -> None:
        if not args.listen:
            return self.dispatch(self.read())
        self.listen()

    def listen(self) -> None:
        with subprocess.Popen(self.follower_command, stdout=subprocess.PIPE) as p: # TODO maybe use this to get info than just a hook? meh
            self.dispatch(self.read()) # send initial output
            while not p.poll() and p.stdout:
                output = p.stdout.readline().decode("utf-8")
                if re.match(self.follower_pattern, output):
                    self.dispatch(self.read())

    def dispatch(self, stdout: dict | list) -> None:
        if args.pprint:
            print(json.dumps(stdout, indent=2, ensure_ascii=False))
        else:
            print(json.dumps(stdout, ensure_ascii=False))

    def read(self) -> dict | list:
        ...

class Bluetooth(BaseListener):
    def __init__(self) -> None:
        super().__init__(["journalctl", "-fu", "bluetooth.service"], ".+")

    def read(self) -> list | dict:
        return {"error": "aaaaaaaaAAAAAAAAAAAAAAAAa"}

class Workspaces(BaseListener):
    def __init__(self) -> None:
        super().__init__(["socat", "-u", f"UNIX-CONNECT:/tmp/hypr/{os.environ['HYPRLAND_INSTANCE_SIGNATURE']}/.socket2.sock", "-"], "(workspace)")

    def read(self):
        return {
            "active": json.loads(read_shell(["hyprctl", "activeworkspace", "-j"]))["id"]
        }

class Network(BaseListener):
    def __init__(self) -> None:
        super().__init__(["nmcli", "monitor"], "(.+\\sconnected|.+\\sdisconnected|Connectivity)")

    def read(self) -> list | dict:
        buff = {}
        buff["ssid"] = None
        buff["type"] = None
        buff["strength"] = None
        buff["device"] = None
        buff["connectivity"] = read_shell(["nmcli", "-t", "-f", "CONNECTIVITY", "general", "status"])

        if strength := read_shell("nmcli -t -f IN-USE,SIGNAL dev wifi list | grep -E '\\*.+' | cut -c 3-", shell=True, ignore_error=True):
            buff["strength"] = strength

        status = read_shell(["nmcli", "device", "status"])
        for data in status.split("\n")[1:]: # ignore header
            device, device_type, device_state, device_connection = re.sub("(\\s(\\s+))", "|", data.strip()).split("|") # re.split is wack
            if args.types and device_type not in args.types:
                continue

            if device_state == "connected":
                buff["type"] = device_type
                buff["ssid"] = device_connection
                buff["device"] = device
                break

        return buff

class Player(BaseListener):
    def __init__(self) -> None:
        super().__init__(["dbus-monitor"], ".+(\\/org\\/mpris\\/MediaPlayer2.+PropertiesChanged)")

    def read(self) -> dict | list:
        buff = []
        if not (players := [args.player] if args.player else read_shell(["playerctl", "--list-all"], ignore_error=True).split()):
            return buff

        for player in players:
            title, artist, album, url, art_url, length = read_shell(
                ["playerctl", f"--player={player}", "metadata", "--format",
                 "{{xesam:title}},{{xesam:artist}},{{xesam:album}},{{xesam:url}},{{mpris:artUrl}},{{mpris:length}}"],
                retry=True # idk why but it fails randomly woo
            ).split(",")
            glyph = self.glyph(player)

            buff.append({
                "name": player,
                "glyph": glyph,
                "title": title,
                "artist": artist,
                "album": album,
                "url": url,
                "art_url": art_url,
                "length": length
            })

        return buff

    def glyph(self, player: str) -> str:
        if player.startswith("firefox"):
            return ""
        elif player.startswith("spotify"):
            return ""
        elif player.startswith("discord"):
            return ""
        else:
            return ""

class Audio(BaseListener):
    def __init__(self) -> None:
        super().__init__(["pactl", "subscribe"], ".+(sink|source)")

    def read(self) -> dict | list:
        buff = {}
        for output in ["source", "sink"]:
            data = json.loads(read_shell(["pactl", "-f", "json", "list", f"{output}s"]))

            if isinstance(data, dict):
                data = [data]

            if args.default:
                data = self.default(data, output)

            if args.brief:
                data = self.brief(data)

            buff[output] = data

        return buff

    def default(self, data: list, output: str) -> list:
        default_device = read_shell(["pactl", f"get-default-{output}"])
        for device in data:
            if device.get("name") == default_device:
                return [device]
        return []

    def brief(self, data: list) -> list:
        buff = []
        for device in data:
            port = device.get("ports")
            buff.append({
                "name": device.get("name"),
                "alias": device.get("description"),
                "bus": device.get("properties").get("device.bus"),
                "mute": device.get("mute"),
                "volume": int(device.get("volume").get("front-left").get("value_percent")[:-1]),
                "port": port[0].get("type") if port else "Invalid"
            })
        return buff

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    subparser = parser.add_subparsers(dest="command")
    subparser.required = False

    parser.add_argument("-l", "--listen", help="Listen for changes", action="store_true")
    parser.add_argument("-pp", "--pprint", help="Pretty print output", action="store_true")

    audio = subparser.add_parser("audio")
    audio.add_argument("-d", "--default", help="Show default sink and source", action="store_true")
    audio.add_argument("-b", "--brief", help="Show brief output", action="store_true")

    player = subparser.add_parser("player")
    player.add_argument("-p", "--player", help="Show a particular player")

    network = subparser.add_parser("network")
    network.add_argument("-t", "--types", help="Select device type", nargs="+", default=[])

    workspaces = subparser.add_parser("workspaces")

    network = subparser.add_parser("bluetooth")

    args = parser.parse_args()
    match args.command:
        case "audio":
            Audio().execute()
        case "player":
            Player().execute()
        case "network":
            Network().execute()
        case "workspaces":
            Workspaces().execute()
        case "bluetooth":
            Bluetooth().execute()
        case _:
            BaseListener(None, None).dispatch({"error": "you dumbass"})
