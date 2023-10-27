#!/usr/bin/python3

import re
import subprocess, sys, os
import json, requests
import time
import bluetooth as bluez
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

def read_shell(command: list | str, shell: bool = False, ignore_error: bool = False, retry: bool = False, _attempts: int = 0, timeout: float | None = None) -> str:

    try:
        p = subprocess.run(command, shell=shell, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=timeout)
    except subprocess.TimeoutExpired:
        return ""

    if p.returncode != 0:
        print(f"ERROR: {p.stderr.decode('utf-8').strip()}", file=sys.stderr)
        if retry and _attempts < 5:
            time.sleep(1)
            print(f"Retrying {command if isinstance(command, str) else ' '.join(command)} ... {_attempts}", file=sys.stderr)
            return read_shell(command, shell=shell, ignore_error=ignore_error, retry=retry, _attempts = _attempts + 1)

        if ignore_error:
            return ""

        exit(1)

    return p.stdout.decode("utf-8").strip()

class BaseListener:
    def __init__(self, follower_command: list | str, follower_pattern: str, shell: bool = False) -> None:
        self.follower_command = follower_command
        self.follower_pattern = follower_pattern
        self.shell = shell

    def execute(self) -> None:
        if not args.listen:
            return self.dispatch(self.read())
        self.listen()

    def listen(self) -> None:
        with subprocess.Popen(self.follower_command, stdout=subprocess.PIPE, shell=self.shell) as p: # TODO maybe use this to get info than just a hook? meh
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

class SignalListener(BaseListener):
    def __init__(self, interval: int = 1) -> None:
        self.interval = interval
        self.registered = []

    # TODO maybe make this run on a seperate thread?
    @staticmethod
    def on_enable(var: str):
        def decorator(func):
            setattr(func, 'eww_variable', var)
            setattr(func, 'reset', False)
            return func
        return decorator

    @staticmethod
    def on_signal(var: str):
        def decorator(func):
            setattr(func, 'eww_variable', var)
            return func
        return decorator

    def listen(self) -> None:
        while True:
            for func in self.registered:
                var = getattr(func, 'eww_variable', None)
                data = read_shell(["eww", "get", var])

                if var is not None and data not in ["null", "false"]:
                    func(data)
                    if getattr(func, 'reset', True):
                        read_shell(["eww", "update", f"{var}=null"])

            time.sleep(self.interval)

    def read(self) -> dict | list:
        print(f"Invalid Operation, --listen must be provided for '{args.command}'", file=sys.stderr)
        return {}

# caches at each interval, hence making it different from defpoll, useful for web requests
class CachedIntervalListener(BaseListener):
    def __init__(self, identifier: str, interval: int) -> None:
        self.interval = interval
        self.identifier = identifier
        self.cache_path = Path("~/.dotfiles/data/cache.json").expanduser()

        if not self.cache_path.exists():
            self.cache_path.parent.mkdir(exist_ok=True)
            with open(self.cache_path, "w") as fw: fw.write('{}')

    def listen(self) -> None:
        timestamp, cache = self.read_cache()
        self.dispatch(cache)
        while True:
            time.sleep(1)
            if timestamp < time.time():
                timestamp, cache = self.write_cache()
                self.dispatch(cache)

    def write_cache(self) -> tuple[float, dict | list]:
        with open(self.cache_path, "r") as fr:
            try:
                content = json.load(fr)
            except json.decoder.JSONDecodeError:
                content = {}

        with open(self.cache_path, "w") as fw:
            timestamp = time.time() + self.interval
            cache = self.read()
            content[self.identifier] = {
                "timestamp": timestamp,
                "cache": cache
            }
            json.dump(content, fw, indent=2)

        return timestamp, cache

    def read_cache(self) -> tuple[float, dict | list]:
        with open(self.cache_path, "r") as f:
            try:
                data = json.load(f).get(self.identifier)
            except json.decoder.JSONDecodeError:
                data = {}

        if data:
            return data["timestamp"], data["cache"]
        else:
            return self.write_cache()

class Weather(CachedIntervalListener):
    def __init__(self) -> None:
        super().__init__(identifier="weather", interval=3600)
        self.location = args.location
        self.api = os.getenv("OPENWEATHER_API_KEY")

    def read(self) -> dict:
        # https://openweathermap.org/api/geocoding-api
        with requests.get(f"http://api.openweathermap.org/geo/1.0/direct?q={self.location}&limit=1&appid={self.api}") as r:
            if r.status_code != 200 or not (data := r.json()):
                print(f"could not find the location {self.location}", file=sys.stderr)
                return {}
            lat, lon = data[0]["lat"], data[0]["lon"]

        # https://openweathermap.org/current
        with requests.get(f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={self.api}") as r:
            if r.status_code != 200:
                print(f"Could not fetch weather info", file=sys.stderr)
                return {}
            data = r.json()

        image = Path("~/.dotfiles/images/weather.png").expanduser()
        with requests.get(f"https://openweathermap.org/img/wn/{data['weather'][0]['icon']}@2x.png") as r:
            if r.status_code != 200:
                print(f"Could not fetch weather image", file=sys.stderr)

            with open(image, "wb") as f:
                f.write(r.content)

        return {
            "location": data["name"],
            "temperature": f'{data["main"]["temp"] - 273.15:.1f}°C',
            "image": f'file://{image}',
            "feelslike": f'{data["main"]["feels_like"] - 273.15:.1f}°C',
            "description": data["weather"][0]["main"].capitalize(),
            "windspeed": data["wind"]["speed"],
            "visibility": data["visibility"]
        }

class Schedule(SignalListener):
    def __init__(self) -> None:
        super().__init__(interval=1)
        self.registered.extend([
            self.fetch,
            self.add_event,
            self.remove_event
        ])
        self.path = Path("~/.dotfiles/data/schedule.json").expanduser()
        if not self.path.parent.exists() or not self.path.exists():
            self.path.parent.mkdir(exist_ok=True)
            with open(self.path, "w") as f:
                json.dump(self.template(), f, indent=2)

        with open(self.path, "r") as f:
            self._schedule = json.load(f)

    def write(self):
        with open(self.path, "w") as f:
            json.dump(self._schedule, f, indent=2)

    def template(self) -> dict:
        return {
            "sunday": {},
            "monday": {},
            "tuesday": {},
            "wednesday": {},
            "thursday": {},
            "friday": {},
            "saturday": {},
        }

    @SignalListener.on_enable("s_schedule_fetch")
    def fetch(self, week):
        buff = []
        for time, event in self._schedule[week.lower()].items():
            buff.append({
                "time": time,
                "event": event
            })

        self.dispatch(sorted(buff, key=lambda x: x["time"])) # yeah i know idc

    @SignalListener.on_signal("s_schedule_add")
    def add_event(self, _):
        data = read_shell(["zenity", "--forms",
                   "--add-entry=Event Title",
                   "--add-entry=Event Time",
                   "--add-list=Select Day", "--list-values=sunday|monday|tuesday|wednesday|thursday|friday|saturday"], ignore_error=True).split("|")

        if len(data) != 3:
            return
        title, time, day = data

        if not title:
            read_shell(["notify-send", "No title specified"])
            return

        if not re.match("^(2[0-3]|(1|0)[0-9]):([0-5][0-9])$", time):
            read_shell(["notify-send", "Invalid time"])
            return

        if not day:
            read_shell(["notify-send", "No day specified"])
            return

        self._schedule[day][time] = title
        self.write()

    @SignalListener.on_signal("s_schedule_remove")
    def remove_event(self, data):
        data = json.loads(data)
        try:
            del self._schedule[data["day"].lower()][data["time"]]
        except KeyError:
            print(f"Could not delete schedule with the following data: {data}", file=sys.stderr)

        self.write()

class Wifi(SignalListener):
    def __init__(self) -> None:
        super().__init__()
        self.registered.extend([
            self.connect,
            self.scan
        ])

    @SignalListener.on_signal("s_wifi_connect")
    def connect(self, ssid) -> None:
        # TODO handle remembering wifi and open connections
        password = read_shell(["zenity", "--entry", "--hide-text", f"--text=Connecting to {ssid}"], ignore_error=True)
        if read_shell(["nmcli", "device", "wifi", "connect", ssid, "password", password], ignore_error=True):
            read_shell(["notify-send", f"Successfully connected to network {ssid}"])
        else:
            read_shell(["notify-send", f"Could not connect to network {ssid}"])

    @SignalListener.on_enable("s_wifi_scan")
    def scan(self, _) -> None:
        read_shell(["nmcli", "device", "wifi", "rescan"])

        buff = []
        for device in dict.fromkeys(read_shell(["nmcli", "-t", "-f", "SSID", "dev", "wifi", "list"]).split("\n")):
            buff.append({
                "ssid": device
            })
        self.dispatch(buff)

class Bluetooth(SignalListener):
    def __init__(self) -> None:
        super().__init__()
        self.socket = bluez.BluetoothSocket()
        self.registered.extend([
            self.scan
        ])

    @SignalListener.on_enable("s_bluetooth_scan")
    def scan(self, _) -> None:
        buff = []

        try:
            devices = bluez.discover_devices(lookup_names=True)
            for addr, name in devices:
                buff.append({
                    "addr": addr,
                    "name": name
                })
        except OSError:
            pass

        self.dispatch(buff)

class Power(BaseListener):
    def __init__(self) -> None:
        super().__init__(["journalctl", "-fu", "lenovo-profile.service"], "(.+lenovo-profile)")

    def read(self) -> dict | list:
        status = read_shell(["journalctl", "-u", "lenovo-profile.service", "-n", "1"]).split()[-1]

        return {
            "status": status,
            "glyph": self.glyph(status)
        }

    def glyph(self, data) -> str:
        match data:
            case "Performance":
                return "󰓅 "
            case "Cooling":
                return " "
            case "Balanced":
                return "󰈐 "
            case _:
                return "󰈐 "

class Workspaces(BaseListener):
    def __init__(self) -> None:
        super().__init__(["socat", "-u", f"UNIX-CONNECT:/tmp/hypr/{os.environ['HYPRLAND_INSTANCE_SIGNATURE']}/.socket2.sock", "-"], "(workspace)")

        # persistent
        self.persistent = [
            {"id": 1, "glyph": ""},
            {"id": 2, "glyph": ""},
            {"id": 3, "glyph": ""},
            {"id": 4, "glyph": ""}
        ]

    def read(self):
        time.sleep(0.1) # weird bug in hyprctl causes same pinned windows to show up twice in `hyprctl workspaces` yeeeeeeee
        current = json.loads(read_shell(["hyprctl", "activeworkspace", "-j"]))["id"]
        workspaces = json.loads(read_shell(["hyprctl", "workspaces", "-j"]))
        active = [*self.persistent] # avoid referencing

        for workspace in workspaces:
            id = workspace.get("id")
            if id not in (x["id"] for x in active) and id > 0: # ignore scratchpad
                active.append({"id": id, "glyph": ""})

        if current not in (x["id"] for x in active):
            active.append({"id": current, "glyph": ""})

        return {
            "active": active,
            "current": current
        }

class Network(BaseListener):
    def __init__(self) -> None:
        super().__init__("nmcli monitor & journalctl -fu bluetooth.service", "(.+\\sconnected|.+\\sdisconnected|Connectivity|.+bluetoothd)", shell=True)

    def read(self) -> list | dict:
        buff = {}
        buff["bluetooth"] = read_shell("bluetoothctl info | grep 'Name' | sed 's/\\sName:\\s//g'", shell=True) or None
        buff["ssid"] = None
        buff["type"] = None
        buff["device"] = None
        buff["connectivity"] = read_shell(["nmcli", "-t", "-f", "CONNECTIVITY", "general", "status"])

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
        buff = {
            "status": read_shell(["playerctl", "status"], ignore_error=True),
            "alive": []
        }

        players = [args.player] if args.player else read_shell(["playerctl", "--list-all"], ignore_error=True).split()
        if not players:
            return buff

        for player in players:
            data = read_shell(
                ["playerctl", f"--player={player}", "metadata", "--format",
                 "{{xesam:title}}:!:{{xesam:artist}}:!:{{xesam:album}}:!:{{xesam:url}}:!:{{mpris:artUrl}}:!:{{duration(mpris:length)}}"],
                retry=True, ignore_error=True # idk why but it fails randomly woo
            )

            if not data:
                return buff

            title, artist, album, url, art_url, length = data.split(":!:")
            buff["alive"].append({
                "name": player,
                "glyph": self.glyph(player),
                "title": title,
                "artist": artist,
                "album": album,
                "url": url,
                "art_url": self.playerart(art_url) or f'file://{Path("~/.config/eww/images/playerart-default.png").expanduser()}',
                "length": length
            })

        return buff

    def playerart(self, url) -> str | None:
        if not url:
            return

        if url.startswith("file://"):
            return url

        with requests.get(url) as r:
            if r.status_code != 200:
                print("Could not find playerart", file=sys.stderr)
                return

            path = Path("~/.dotfiles/images/playerart.png").expanduser()
            with open(path, "wb") as f:
                f.write(r.content)

        return f"file://{path}"

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
        super().__init__(["pactl", "subscribe"], ".+(sink|source|server|sink-inputs)")

    def read(self) -> dict | list:
        buff = {}
        for output in ["source", "sink", "sink-input", "source-output"]:
            data = json.loads(read_shell(["pactl", "-f", "json", "list", f"{output}s"]))

            if not data:
                return buff

            if isinstance(data, dict):
                data = [data]

            if args.default:
                data = self.default(data, output)

            if args.brief:
                data = self.brief(data, output)

            buff[output] = data

        return buff

    def default(self, data: list, output: str) -> list:
        if output not in ["source", "sink"]:
            return data

        default_device = read_shell(["pactl", f"get-default-{output}"])
        for i, device in enumerate(data):
            if device.get("name") == default_device:
                data.insert(0, data.pop(i))
                break

        return data

    def brief(self, data: list) -> list:
        buff = []
        for device in data:
            port = device.get("ports")
            try:
                volvar = int(device.get("volume").get("front-left").get("value_percent")[:-1])
            except: volvar = int(device.get("volume").get("mono").get("value_percent")[:-1])
            buff.append({
                "name": device.get("name"),
                "alias": device.get("description"),
                "bus": device.get("properties").get("device.bus"),
                "mute": device.get("mute"),
                "volume": volvar,
                "port": port[0].get("type") if port else "Invalid"
            })
        return buff

            elif output == "source-output":
                buff.append({
                    "index": device.get("index"),
                    "name": device.get("properties").get("application.name"),
                    "mute": device.get("mute"),
                    "volume": int(device.get("volume").get("front-left").get("value_percent")[:-1]),
                })

            elif output in ["source", "sink"]:
                port = device.get("ports")
                buff.append({
                    "index": device.get("index"),
                    "name": device.get("name"),
                    "alias": device.get("description"),
                    "bus": device.get("properties").get("device.bus"),
                    "mute": device.get("mute"),
                    "volume": int(device.get("volume").get("front-left").get("value_percent")[:-1]),
                    "port": port[0].get("type") if port else None
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

    weather = subparser.add_parser("weather")
    weather.add_argument("-l", "--location", help="The location to fetch data for", required=True)

    schedule = subparser.add_parser("schedule")
    workspaces = subparser.add_parser("workspaces")
    power = subparser.add_parser("power")
    bluetooth = subparser.add_parser("bluetooth")
    wifi = subparser.add_parser("wifi")

    args = parser.parse_args()
    match args.command:
        case "weather":
            Weather().execute()
        case "audio":
            Audio().execute()
        case "player":
            Player().execute()
        case "network":
            Network().execute()
        case "schedule":
            Schedule().execute()
        case "workspaces":
            Workspaces().execute()
        case "power":
            Power().execute()
        case "wifi":
            Wifi().execute()
        case "bluetooth":
            Bluetooth().execute()
        case _:
            print("you dumbass", file=sys.stderr)
