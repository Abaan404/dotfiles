import { App, Astal, Gtk, Gdk } from "astal/gtk3";
import { GLib, Variable, bind } from "astal";

import Hyprland from "gi://AstalHyprland";
import Tray from "gi://AstalTray";
import Bluetooth from "gi://AstalBluetooth";
import Network from "gi://AstalNetwork";
import WirePlumber from "gi://AstalWp?version=0.1";
import Battery from "gi://AstalBattery?version=0.1";

import { get_player_glyph, symbolic_strength } from "../utils/glyphs";
import { truncate } from "../utils/strings";
import { clamp } from "../utils/math";

import { PlayerSelected } from "../helpers/variables";
import window_handler from "../helpers/window";

function Launcher() {
    const reveal = Variable(false);

    return (
        <button
            className="launcher"
            onClick="bash -c 'pkill rofi || rofi -show drun'"
            onHover={() => reveal.set(true)}
            onHoverLost={() => reveal.set(false)}>
            <box
                className="widget">
                <icon icon="!!HOME/.config/ags/assets/launcher.png" />
                <revealer
                    transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
                    transitionDuration={500}
                    css="padding-left: 10px"
                    revealChild={reveal()}>
                    <label label="Launcher" />
                </revealer>
            </box>
        </button>
    );
}

function Workspaces() {
    const hyprland = Hyprland.get_default();

    const workspaces = Variable.derive([bind(hyprland, "workspaces"), bind(hyprland, "focused_workspace")], (workspaces, focused) => {
        const visible = [
            { id: 1, glyph: "" },
            { id: 2, glyph: "" },
            { id: 3, glyph: "" },
            { id: 4, glyph: "" },
        ];

        workspaces
            .sort((a, b) => a.get_id() - b.get_id())
            // named workspaces have negative indices
            .filter(ws => ws.get_id() > visible[visible.length - 1].id)
            .forEach(ws => visible.push({ id: ws.id, glyph: "" }));

        return visible.map(
            (ws) => {
                return (
                    <button
                        className={focused.id == ws.id
                            ? "active"
                            : "inactive"}
                        onClick={() => hyprland.dispatch("workspace", ws.id.toString())}>
                        {ws.glyph}
                    </button>
                );
            },
        );
    });

    return (
        <button
            className="workspaces">
            <box spacing={20} className="widget">
                {workspaces()}
            </box>
        </button>
    );
}

const showSystray = Variable(false);

function SysInfo() {
    const ram = Variable("0.0G")
        .poll(5000, ["bash", "-c", "free -hg | awk 'NR == 2 {print $3}' | sed 's/Gi/G/'"]);

    const cpu = Variable("0.0G")
        .poll(5000, ["bash", "-c", "top -bn1 | sed -n '/Cpu/p' | awk '{print $2}' | sed 's/..,//'"]);

    return (
        <button
            onClick={() => showSystray.set(!showSystray.get())}
            className="sysinfo">
            <box
                className="widget"
                spacing={12}>

                {ram().as(val => ` ${val}`)}
                {cpu().as(val => ` ${val}%`)}
            </box>
        </button>
    );
}

function SysTray() {
    const tray = Tray.get_default();

    return (
        <revealer
            transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
            revealChild={showSystray()}
            transitionDuration={500}>

            <button
                className="systray">
                <box
                    className="widget">
                    {bind(tray, "items").as(items => items.map(item => (
                        <menubutton
                            tooltipMarkup={bind(item, "tooltipMarkup")}
                            usePopover={false}
                            // @ts-ignore: the prop exists
                            actionGroup={bind(item, "actionGroup").as(ag => ["dbusmenu", ag])}
                            menuModel={bind(item, "menuModel")}>
                            <icon gicon={bind(item, "gicon")} />
                        </menubutton>
                    )))}
                </box>
            </button>
        </revealer>
    );
}

function Player({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
    return (
        <button
            className="player"

            onClick={(_, e) => {
                const player = PlayerSelected.get();
                if (!player) {
                    return;
                }

                switch (e.button) {
                    case Astal.MouseButton.PRIMARY:
                        window_handler.toggle_window("mpris", gdkmonitor);
                        break;

                    case Astal.MouseButton.SECONDARY:
                        if (player.get_can_go_next()) {
                            player.next();
                        }
                        break;

                    case Astal.MouseButton.MIDDLE:
                        if (player.get_can_play()) {
                            player.play_pause();
                        }
                        break;

                    default:
                        break;
                }
            }}

            visible={PlayerSelected().as(player => player !== undefined)}>
            <box
                className="widget"
                spacing={20}>
                <label label={PlayerSelected().as((player) => {
                    if (!player) {
                        return get_player_glyph("");
                    }

                    return get_player_glyph(player.get_bus_name());
                })} />

                <label label={PlayerSelected().as((player) => {
                    if (!player) {
                        return "";
                    }

                    const title = player.get_title();
                    const artists = player.get_artist();

                    let player_string = title;
                    if (artists.length > 0)
                        player_string = `${truncate(artists, 30)} - ${truncate(title, 30)}`;

                    return player_string;
                })} />

            </box>
        </button>
    );
}

function Media() {
    const bluetooth = Bluetooth.get_default();
    const audio = WirePlumber.get_default()?.audio;

    function EndpointWidget({ endpoint, glyph, spacing }: { endpoint: WirePlumber.Endpoint | undefined; glyph: Variable<string>; spacing: number }) {
        let volume = Variable("0%");
        let visible = Variable(false);

        if (endpoint) {
            volume = Variable.derive(
                [bind(endpoint, "volume")],
                volume => `${Math.ceil(volume * 100)}%`,
            );

            visible = Variable.derive(
                [bind(endpoint, "mute")],
                mute => !mute,
            );
        }

        return (
            <button
                onScroll={(_, e) => {
                    if (!endpoint) {
                        return;
                    }

                    const delta = 0.1;
                    switch (e.direction) {
                        case Gdk.ScrollDirection.UP:
                            endpoint.volume = clamp(endpoint.volume + delta, 0, 1);
                            break;

                        case Gdk.ScrollDirection.DOWN:
                            endpoint.volume = clamp(endpoint.volume - delta, 0, 1);
                            break;

                        default:
                            break;
                    }
                }}

                onClick={(_, e) => {
                    if (!endpoint) {
                        return;
                    }

                    switch (e.button) {
                        case Astal.MouseButton.MIDDLE:
                            endpoint.mute = !endpoint.mute;
                            break;

                        default:
                            break;
                    }
                }}>
                <box
                    className="sink"
                    spacing={spacing}>
                    <label label={glyph()} />
                    <label label={volume()} visible={visible()} />
                </box>
            </button>
        );
    }

    let class_names = Variable("media muted");
    let speaker_glyph = Variable("󰖁 ");
    let microphone_glyph = Variable(" ");

    if (audio) {
        class_names = Variable.derive(
            [bind(bluetooth, "is_connected"), bind(audio, "default_speaker"), bind(audio.default_speaker, "mute")],
            (is_connected, _, mute) => {
                const ret = ["media"];

                is_connected
                    ? ret.push("bluetooth")
                    : null;

                mute
                    ? ret.push("muted")
                    : null;

                return ret.join(" ");
            },
        );

        speaker_glyph = Variable.derive(
            [bind(audio.default_speaker, "icon"), bind(audio.default_speaker, "volume"), bind(audio.default_speaker, "mute")],
            (icon, volume, mute) => {
                if (icon.includes("headset")) {
                    return " ";
                }
                else if (mute) {
                    return "󰝟 ";
                }
                else {
                    return symbolic_strength(volume, ["󰖀 ", "󰕾 "], 1);
                }
            },
        );

        microphone_glyph = Variable.derive(
            [bind(audio.default_microphone, "mute")],
            (mute) => {
                if (mute) {
                    return " ";
                }
                else {
                    return " ";
                }
            },
        );
    }

    return (
        <button
            className={class_names()}>
            <box
                className="widget"
                spacing={10}>
                <EndpointWidget endpoint={audio?.default_speaker} glyph={speaker_glyph} spacing={6} />
                <EndpointWidget endpoint={audio?.default_microphone} glyph={microphone_glyph} spacing={1} />
            </box>
        </button>
    );
}

function Info() {
    function TimeInfo() {
        const time = (format: string) => Variable("").poll(1000, () =>
            GLib.DateTime.new_now_local().format(format)!);

        const reveal = Variable(false);
        return (
            <button
                className="clock"
                onHover={() => reveal.set(true)}
                onHoverLost={() => reveal.set(false)}>
                <box>
                    <label label={time("%H:%M")()} />

                    <revealer
                        transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
                        transitionDuration={500}
                        css="padding-left: 5px;"
                        reveal_child={reveal()}>
                        <label label={time("%a, %d %B %Y")()} />
                    </revealer>
                </box>
            </button>
        );
    }

    function NetworkInfo() {
        const network = Network.get_default();

        const class_name = Variable.derive(
            [bind(network, "primary"), bind(network.wifi, "internet")],
            (primary, wifi_internet) => {
                let internet = Network.Internet.DISCONNECTED;

                switch (primary) {
                    case Network.Primary.WIFI:
                        internet = wifi_internet;
                        break;

                    case Network.Primary.WIRED:
                        { /* internet = wired_internet; */ }
                        break;

                    default:
                        break;
                }

                return internet.toString();
            },
        );

        const label = Variable.derive(
            [bind(network, "primary"), bind(network.wifi, "internet"), bind(network.wifi, "strength")],
            (primary, internet, strength) => {
                switch (primary) {
                    case Network.Primary.WIFI:
                        switch (internet) {
                            case Network.Internet.CONNECTING:
                                return symbolic_strength(strength, ["󰤫 ", "󰤠 ", "󰤣 ", "󰤦 "], 100);

                            case Network.Internet.CONNECTED:
                                return symbolic_strength(strength, ["󰤯 ", "󰤟 ", "󰤢 ", "󰤥 "], 100);

                            default:
                                break;
                        }
                        break;

                    case Network.Primary.WIRED:
                        return " ";

                    default:
                        return "󰤭 ";
                }
            },
        );

        const reveal = Variable(false);
        return (
            <button
                className="network"
                onHover={() => reveal.set(true)}
                onHoverLost={() => reveal.set(false)}>
                <box>
                    <label
                        className={class_name()}
                        label={label()} />

                    <revealer
                        transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
                        transitionDuration={500}
                        css="padding-left: 5px;"
                        reveal_child={reveal()}>
                        <label label={bind(network.wifi, "ssid")} />
                    </revealer>
                </box>
            </button>
        );
    }

    function BatteryInfo() {
        const battery = Battery.get_default();

        const reveal = Variable(false);
        return (
            <button
                className="battery"
                onHover={() => reveal.set(true)}
                onHoverLost={() => reveal.set(false)}>
                <box>
                    <label label={bind(battery, "percentage").as(percentage => symbolic_strength(percentage, [" ", " ", " ", " ", " "], 1))} />
                    <revealer
                        transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
                        transitionDuration={500}
                        css="padding-left: 5px;"
                        reveal_child={reveal()}>
                        <label label={bind(battery, "percentage").as(percentage => `${(percentage * 100).toString()}%`)} />
                    </revealer>
                </box>
            </button>
        );
    }

    return (
        <eventbox
            className="info">
            <box
                className="widget"
                spacing={10}>
                <BatteryInfo />
                <NetworkInfo />
                <TimeInfo />
            </box>
        </eventbox>
    );
}

function Power({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
    const reveal = Variable(false);

    return (
        <button
            className="power"
            onHover={() => reveal.set(true)}
            onHoverLost={() => reveal.set(false)}
            onClick={(_, e) => {
                switch (e.button) {
                    case Astal.MouseButton.PRIMARY:
                        window_handler.toggle_window("powermenu", gdkmonitor);
                        break;

                    default:
                        break;
                }
            }}>
            <box
                className="widget">
                <label label="⏼" css="padding-right: 5px" />
                <revealer
                    transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
                    transitionDuration={500}
                    css="padding-left: 5px;"
                    revealChild={reveal()}>
                    <label label="exit" />
                </revealer>
            </box>
        </button>
    );
}

export default function (gdkmonitor: Gdk.Monitor) {
    return (
        <window
            className="bar"
            margin={10}
            marginBottom={3}
            gdkmonitor={gdkmonitor}
            heightRequest={30}
            exclusivity={Astal.Exclusivity.EXCLUSIVE}
            anchor={Astal.WindowAnchor.TOP
            | Astal.WindowAnchor.LEFT
            | Astal.WindowAnchor.RIGHT}
            application={App}>
            <centerbox>
                <box
                    spacing={10}
                    halign={Gtk.Align.START}>
                    <Launcher />
                    <Workspaces />
                    <SysInfo />
                    <SysTray />
                </box>
                <box
                    spacing={10}
                    halign={Gtk.Align.CENTER}>
                    <Player gdkmonitor={gdkmonitor} />
                </box>
                <box
                    spacing={10}
                    halign={Gtk.Align.END}>
                    <Media />
                    <Info />
                    <Power gdkmonitor={gdkmonitor} />
                </box>
            </centerbox>
        </window>
    );
}
