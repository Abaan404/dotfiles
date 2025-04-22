import { App, Astal, Gtk, Gdk } from "astal/gtk4";
import { GLib, Variable, bind, execAsync } from "astal";

import AstalHyprland from "gi://AstalHyprland";
import AstalTray from "gi://AstalTray";
import AstalBluetooth from "gi://AstalBluetooth";
import AstalNetwork from "gi://AstalNetwork";
import AstalWp from "gi://AstalWp";
import AstalBattery from "gi://AstalBattery";
import Brightness from "../services/brightness";
import ActivePlayer from "../services/activeplayer";

import { truncate, clamp, get_internet_name, get_player_glyph, symbolic_strength } from "../utils/helpers";
import window_handler from "../utils/window";
import app from "astal/gtk4/app";

function Launcher() {
    const reveal = Variable(false);

    return (
        <box
            cssClasses={["launcher"]}
            onButtonPressed={(_, e) => {
                switch (e.get_button()) {
                    case Gdk.BUTTON_PRIMARY:
                        execAsync(["bash", "-c", "pkill rofi || rofi -show drun"]).catch(() => {});
                        break;

                    default:
                        break;
                }
            }}
            onHoverEnter={() => reveal.set(true)}
            onHoverLeave={() => reveal.set(false)}>
            <image iconName="launcher-symbolic" />
            <revealer
                transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
                transitionDuration={500}
                revealChild={reveal()}>
                <label label="Launcher" />
            </revealer>
        </box>
    );
}

function Workspaces() {
    const hyprland = AstalHyprland.get_default();

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

        return visible.map(ws => (
            <button
                widthRequest={44}
                cssClasses={focused.id == ws.id ? ["active"] : ["inactive"]}
                onButtonPressed={() => hyprland.dispatch("workspace", ws.id.toString())}>
                {ws.glyph}
            </button>
        ));
    });

    return (
        <box
            cssClasses={["workspaces"]}
            onDestroy={() => workspaces.drop()}>
            {workspaces()}
        </box>
    );
}

const showSystray = Variable(false);

function SysInfo() {
    const ram = Variable("0.0G")
        .poll(5000, ["bash", "-c", "free -hg | awk 'NR == 2 {print $3}' | sed 's/Gi/G/'"]);

    const cpu = Variable("0.0G")
        .poll(5000, ["bash", "-c", "top -bn1 | sed -n '/Cpu/p' | awk '{print $2}' | sed 's/..,//'"]);

    return (
        <box
            cssClasses={["sysinfo"]}
            onButtonPressed={(_, e) => {
                switch (e.get_button()) {
                    case Gdk.BUTTON_PRIMARY:
                        showSystray.set(!showSystray.get());
                        break;

                    case Gdk.BUTTON_SECONDARY:
                        app.inspector();
                        break;

                    default:
                        break;
                }
            }}
            spacing={12}>
            {ram().as(val => ` ${val}`)}
            {cpu().as(val => ` ${val}%`)}
        </box>
    );
}

function SysTray() {
    const tray = AstalTray.get_default();

    return (
        <revealer
            transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
            revealChild={showSystray()}
            transitionDuration={500}>
            <box
                cssClasses={["systray"]}>
                {bind(tray, "items").as(items => items.map(item => (
                    <menubutton
                        tooltipMarkup={bind(item, "tooltipMarkup")}
                        // @ts-ignore: the prop exists
                        actionGroup={bind(item, "actionGroup").as(ag => ["dbusmenu", ag])}
                        menuModel={bind(item, "menuModel")}>
                        <image gicon={bind(item, "gicon")} />
                    </menubutton>
                )))}
            </box>
        </revealer>
    );
}

function Player({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
    const active_player = ActivePlayer.get_default();

    return (
        <box
            cssClasses={["player"]}
            onScroll={(_1, _2, dy) => {
                if (dy > 0) {
                    active_player.next_player();
                }
                else if (dy < 0) {
                    active_player.prev_player();
                }
            }}
            onButtonPressed={(_, e) => {
                const player = active_player.player;
                if (!player) {
                    return;
                }

                switch (e.get_button()) {
                    case Gdk.BUTTON_PRIMARY:
                        window_handler.toggle_window("mpris", gdkmonitor);
                        break;

                    case Gdk.BUTTON_SECONDARY:
                        if (player.get_can_go_next()) {
                            player.next();
                        }
                        break;

                    case Gdk.BUTTON_MIDDLE:
                        if (player.get_can_play()) {
                            player.play_pause();
                        }
                        break;

                    default:
                        break;
                }
            }}
            visible={bind(active_player, "player").as(player => player !== null)}
            spacing={20}>
            <label label={bind(active_player, "player").as((player) => {
                if (!player) {
                    return get_player_glyph("");
                }

                return get_player_glyph(player.get_bus_name());
            })} />
            {bind(active_player, "player").as((player) => {
                if (!player) {
                    return <label label="No Title" />;
                }

                return (
                    <box spacing={8}>
                        <label label={bind(player, "title").as(title => title && title !== "" ? truncate(title, 30) : "No Title")} />
                        <label label="-" />
                        <label label={bind(player, "artist").as(artist => artist && artist !== "" ? truncate(artist, 30) : "")} />
                    </box>
                );
            })}
        </box>
    );
}

// FIXME: update component whenever an audio device is detected
function Audio({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
    const bluetooth = AstalBluetooth.get_default();
    const audio = AstalWp.get_default()?.get_audio();

    function EndpointWidget({ endpoint, glyph, spacing }: { endpoint?: AstalWp.Endpoint | null; glyph: Variable<string>; spacing: number }) {
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
                onScroll={(_1, _2, dy) => endpoint?.set_volume(clamp(endpoint.get_volume() - dy / 15, 0, 1))}
                onButtonPressed={(_, e) => {
                    switch (e.get_button()) {
                        case Gdk.BUTTON_MIDDLE:
                            endpoint?.set_mute(!endpoint.get_mute());
                            break;

                        default:
                            break;
                    }
                }}
                onDestroy={() => {
                    volume.drop();
                    visible.drop();
                }}>
                <box
                    cssClasses={["sink"]}
                    spacing={spacing}>
                    <label label={glyph()} />
                    <label label={volume()} visible={visible()} />
                </box>
            </button>
        );
    }

    const speaker = audio?.get_default_speaker();
    const microphone = audio?.get_default_microphone();

    let class_names = Variable(["audio", "muted"]);
    let speaker_glyph = Variable("󰖁 ");
    let microphone_glyph = Variable(" ");

    if (audio) {
        if (speaker) {
            class_names = Variable.derive(
                [bind(bluetooth, "is_connected"), bind(speaker, "mute")],
                (is_connected, mute) => {
                    const ret = ["audio"];

                    if (is_connected) {
                        ret.push("bluetooth");
                    }

                    if (mute) {
                        ret.push("muted");
                    }

                    return ret;
                },
            );

            speaker_glyph = Variable.derive(
                [bind(speaker, "icon"), bind(speaker, "volume"), bind(speaker, "mute")],
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
        }

        if (microphone) {
            microphone_glyph = Variable.derive(
                [bind(microphone, "mute")],
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
    }

    return (
        <box
            cssClasses={class_names()}
            spacing={10}
            onButtonPressed={(_, e) => {
                switch (e.get_button()) {
                    case Gdk.BUTTON_PRIMARY:
                        window_handler.toggle_window("media", gdkmonitor);
                        break;

                    default:
                        break;
                }
            }}
            onDestroy={() => {
                speaker_glyph.drop();
                microphone_glyph.drop();
                class_names.drop();
            }}>
            <EndpointWidget endpoint={speaker} glyph={speaker_glyph} spacing={6} />
            <EndpointWidget endpoint={microphone} glyph={microphone_glyph} spacing={1} />
        </box>
    );
}

function Info({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
    function TimeInfo() {
        const time = (format: string) => Variable("").poll(1000, () =>
            GLib.DateTime.new_now_local().format(format)!);

        const reveal = Variable(false);
        return (
            <button
                cssClasses={["clock"]}
                onHoverEnter={() => reveal.set(true)}
                onHoverLeave={() => reveal.set(false)}>
                <box>
                    <label label={time("%H:%M")()} />
                    <revealer
                        transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
                        transitionDuration={500}
                        reveal_child={reveal()}>
                        <label label={time("%a, %d %B %Y")()} />
                    </revealer>
                </box>
            </button>
        );
    }

    function AstalNetworkInfo() {
        const network = AstalNetwork.get_default();
        const wired = network.get_wired();
        const wifi = network.get_wifi();

        let internet: Variable<string[]> = Variable(["disconnected"]);
        let ssid: Variable<string | null> = Variable(null);
        let icon = Variable("network-wireless-signal-none-symbolic");

        if (!wifi && !wired) {
            return (<></>);
        }

        if (network.primary === AstalNetwork.Primary.WIRED && wired) {
            ssid = Variable("Wired");

            icon = Variable.derive(
                [bind(wired, "icon_name")],
                icon_name => icon_name,
            );

            internet = Variable.derive(
                [bind(wired, "internet")],
                internet => [get_internet_name(internet)],
            );
        }

        else if (network.primary === AstalNetwork.Primary.WIFI && wifi) {
            ssid = Variable.derive(
                [bind(wifi, "active_access_point")],
                active_access_point => active_access_point ? active_access_point.get_ssid() : null,
            );

            icon = Variable.derive(
                [bind(wifi, "icon_name")],
                icon_name => icon_name,
            );

            internet = Variable.derive(
                [bind(wifi, "internet"), ssid],
                (internet, ssid) => {
                    if (!ssid) {
                        return ["disconnected"];
                    }

                    return [get_internet_name(internet)];
                },
            );
        }

        const reveal = Variable(false);
        return (
            <button
                cssClasses={["network"]}
                onHoverEnter={() => reveal.set(true)}
                onHoverLeave={() => reveal.set(false)}
                onDestroy={() => {
                    internet.drop();
                    ssid.drop();
                    icon.drop();
                }}>
                <box>
                    <image
                        cssClasses={internet()}
                        iconName={icon()} />
                    <revealer
                        transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
                        transitionDuration={500}
                        reveal_child={reveal()}>
                        <label label={ssid().as(ssid => ssid || "unknown")} />
                    </revealer>
                </box>
            </button>
        );
    }

    function AstalBatteryInfo() {
        const battery = AstalBattery.get_default();
        const brightness = Brightness.get_default();

        const reveal = Variable(false);
        return (
            <button
                cssClasses={["battery"]}
                onScroll={(_1, _2, dy) => {
                    brightness.devices.forEach((device) => {
                        if (device.type == "backlight") {
                            device.percentage -= dy / 15;
                        }
                    });
                }}
                onHoverEnter={() => reveal.set(true)}
                onHoverLeave={() => reveal.set(false)}>
                <box>
                    <label label={bind(battery, "percentage").as(percentage => symbolic_strength(percentage, [" ", " ", " ", " ", " "], 1))} />
                    <revealer
                        transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
                        transitionDuration={500}
                        reveal_child={reveal()}>
                        <label label={bind(battery, "percentage").as(percentage => `${(Math.floor(percentage * 100)).toString()}%`)} />
                    </revealer>
                </box>
            </button>
        );
    }

    return (
        <box
            cssClasses={["info"]}
            spacing={10}
            onButtonPressed={(_, e) => {
                switch (e.get_button()) {
                    case Gdk.BUTTON_PRIMARY:
                        window_handler.toggle_window("glance", gdkmonitor);
                        break;

                    default:
                        break;
                }
            }}>
            <AstalBatteryInfo />
            <AstalNetworkInfo />
            <TimeInfo />
        </box>
    );
}

function Power({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
    const reveal = Variable(false);

    return (
        <button
            cssClasses={["power"]}
            onHoverEnter={() => reveal.set(true)}
            onHoverLeave={() => reveal.set(false)}
            onButtonPressed={(_, e) => {
                switch (e.get_button()) {
                    case Gdk.BUTTON_PRIMARY:
                        window_handler.toggle_window("powermenu", gdkmonitor);
                        break;

                    default:
                        break;
                }
            }}>
            <box
                cssClasses={["widget"]}>
                <image iconName="system-log-out-symbolic" />
                <revealer
                    transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
                    transitionDuration={500}
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
            setup={self => self.set_default_size(1, 1)}
            cssClasses={["bar"]}
            gdkmonitor={gdkmonitor}
            visible={true}
            heightRequest={30}
            margin={10}
            marginBottom={3}
            exclusivity={Astal.Exclusivity.EXCLUSIVE}
            anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT}
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
                    <Audio gdkmonitor={gdkmonitor} />
                    <Info gdkmonitor={gdkmonitor} />
                    <Power gdkmonitor={gdkmonitor} />
                </box>
            </centerbox>
        </window>
    );
}
