import App from "ags/gtk4/app";
import GLib from "gi://GLib";
import { Astal, Gtk, Gdk } from "ags/gtk4";
import { createComputed, createExternal, createState, For, With, createBinding, Accessor, onCleanup } from "ags";
import { execAsync } from "ags/process";
import { createPoll } from "ags/time";

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

function Launcher() {
    const [reveal, set_reveal] = createState(false);

    return (
        <button
            class="launcher"
            onClicked={() => execAsync(["bash", "-c", "pkill rofi || rofi -show drun"]).catch(() => {})}>
            <Gtk.EventControllerMotion
                onEnter={() => set_reveal(true)}
                onLeave={() => set_reveal(false)} />

            <box>
                <image iconName="launcher-symbolic" />
                <revealer
                    transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
                    transitionDuration={500}
                    revealChild={reveal}>
                    <label label="Launcher" />
                </revealer>
            </box>
        </button>
    );
}

function Workspaces() {
    const hyprland = AstalHyprland.get_default();
    const focused = createBinding(hyprland, "focused_workspace");

    const workspaces = createComputed([createBinding(hyprland, "workspaces"), createBinding(hyprland, "focused_workspace")], (workspaces, focused) => {
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

        return visible;
    });

    return (
        <box
            class="workspaces">
            <For each={workspaces}>
                {workspace => (
                    <button
                        widthRequest={44}
                        class={focused(focused => focused.id == workspace.id ? "active" : "inactive")}
                        onClicked={() => hyprland.dispatch("workspace", workspace.id.toString())}>
                        {workspace.glyph}
                    </button>
                )}
            </For>
        </box>
    );
}

const [showSystray, set_show_systray] = createState(false);

function SysInfo() {
    const ram = createPoll("0.0G", 5000, ["bash", "-c", "free -hg | awk 'NR == 2 {print $3}' | sed 's/Gi/G/'"]);
    const cpu = createPoll("0.0", 5000, ["bash", "-c", "top -bn1 | sed -n '/Cpu/p' | awk '{print $2}' | sed 's/..,//'"]);

    return (
        <button
            class="sysinfo"
            onClicked={() => set_show_systray(!showSystray.get())}>
            <Gtk.GestureClick
                button={Gdk.BUTTON_SECONDARY}
                onPressed={() => App.inspector()} />

            <box
                spacing={12}>
                <label label={ram(val => ` ${val}`)} />
                <label label={cpu(val => ` ${val}%`)} />
            </box>
        </button>
    );
}

function SysTray() {
    const tray = AstalTray.get_default();
    const items = createBinding(tray, "items");

    return (
        <revealer
            transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
            revealChild={showSystray}
            transitionDuration={500}>
            <box
                class="systray">
                <For each={items}>
                    {(item) => {
                        const pop = Gtk.PopoverMenu.new_from_model(item.menuModel);

                        return (
                            <button
                                $={(self) => {
                                    pop.set_parent(self);
                                    pop.insert_action_group("dbusmenu", item.actionGroup); pop.set_has_arrow(false);
                                    pop.set_has_arrow(false);
                                    const conns = [
                                        item.connect("notify::menu-model", () => pop.set_menu_model(item.menuModel)),
                                        item.connect("notify::action-group", () => pop.insert_action_group("dbusmenu", item.actionGroup)),
                                    ];
                                    onCleanup(() => {
                                        pop.unparent();
                                        conns.map(id => item.disconnect(id));
                                    });
                                }}
                                valign={Gtk.Align.CENTER}
                                tooltip_markup={createBinding(item, "tooltipMarkup")}>
                                <Gtk.GestureClick
                                    button={Gdk.BUTTON_PRIMARY}
                                    onPressed={() => pop.popup()} />
                                <image gicon={createBinding(item, "gicon")} />
                            </button>
                        );
                    }}
                </For>
            </box>
        </revealer>
    );
}

function Player({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
    const active_player = ActivePlayer.get_default();
    const player = createBinding(active_player, "player");

    return (
        <button
            class="player"
            onClicked={() => window_handler.toggle_window("mpris", gdkmonitor)}
            visible={createBinding(active_player, "player").as(player => player !== null)}>
            <Gtk.EventControllerScroll
                flags={Gtk.EventControllerScrollFlags.VERTICAL}
                onScroll={(_1, _2, dy) => active_player.player?.set_volume(clamp(active_player.player.get_volume() - dy / 15, 0, 1))} />
            <Gtk.GestureClick
                button={Gdk.BUTTON_SECONDARY}
                onPressed={() => {
                    if (player.get().get_can_go_next()) {
                        player.get().next();
                    }
                }} />
            <Gtk.GestureClick
                button={Gdk.BUTTON_MIDDLE}
                onPressed={() => {
                    if (player.get().get_can_play()) {
                        player.get().play_pause();
                    }
                }} />

            <box
                spacing={20}>
                <label label={createBinding(active_player, "player").as((player) => {
                    if (!player) {
                        return get_player_glyph("");
                    }

                    return get_player_glyph(player.get_bus_name());
                })} />
                <With value={player}>
                    {(player) => {
                        if (!player) {
                            return <label label="No Title" />;
                        }

                        return (
                            <box spacing={8}>
                                <label label={createBinding(player, "title").as(title => title && title !== "" ? truncate(title, 30) : "No Title")} />
                                <label label="-" />
                                <label label={createBinding(player, "artist").as(artist => artist && artist !== "" ? truncate(artist, 30) : "No Artist")} />
                            </box>
                        );
                    }}
                </With>
            </box>
        </button>
    );
}

// FIXME: update component whenever an audio device is detected
function Audio({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
    const bluetooth = AstalBluetooth.get_default();
    const audio = AstalWp.get_default()?.get_audio();

    function EndpointWidget({ endpoint, glyph, spacing }: { endpoint?: AstalWp.Endpoint | null; glyph: Accessor<string>; spacing: number }) {
        let [volume] = createState("0%");
        let [visible] = createState(false);

        if (endpoint) {
            volume = createComputed(
                [createBinding(endpoint, "volume")],
                volume => `${Math.ceil(volume * 100)}%`,
            );

            visible = createComputed(
                [createBinding(endpoint, "mute")],
                mute => !mute,
            );
        }

        return (
            <box
                class="sink"
                spacing={spacing}>
                <Gtk.GestureClick
                    button={Gdk.BUTTON_MIDDLE}
                    onPressed={() => endpoint?.set_mute(!endpoint.get_mute())} />
                <Gtk.EventControllerScroll
                    flags={Gtk.EventControllerScrollFlags.VERTICAL}
                    onScroll={(_1, _2, dy) => endpoint?.set_volume(clamp(endpoint.get_volume() - dy / 15, 0, 1))} />
                <label label={glyph} />
                <label label={volume} visible={visible} />
            </box>
        );
    }

    const speaker = audio?.get_default_speaker();
    const microphone = audio?.get_default_microphone();

    let [class_names] = createState(["audio", "muted"]);
    let [speaker_glyph] = createState("󰖁 ");
    let [microphone_glyph] = createState(" ");

    if (audio) {
        if (speaker) {
            class_names = createComputed(
                [createBinding(bluetooth, "is_connected"), createBinding(speaker, "mute")],
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

            speaker_glyph = createComputed(
                [createBinding(speaker, "icon"), createBinding(speaker, "volume"), createBinding(speaker, "mute")],
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
            microphone_glyph = createComputed(
                [createBinding(microphone, "mute")],
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
            class={class_names(class_names => class_names.join(" "))}
            spacing={10}>
            <Gtk.GestureClick
                button={Gdk.BUTTON_PRIMARY}
                onPressed={() => window_handler.toggle_window("media", gdkmonitor)} />
            <EndpointWidget endpoint={speaker} glyph={speaker_glyph} spacing={6} />
            <EndpointWidget endpoint={microphone} glyph={microphone_glyph} spacing={1} />
        </box>
    );
}

function Info({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
    function TimeInfo() {
        const time = (format: string) => createExternal(GLib.DateTime.new_now_local().format(format) ?? "", (set) => {
            const interval = setInterval(() => set(GLib.DateTime.new_now_local().format(format) ?? ""), 1000);
            return () => clearInterval(interval);
        });

        const [reveal, set_reveal] = createState(false);
        return (
            <button
                class="clock">
                <Gtk.EventControllerMotion
                    onEnter={() => set_reveal(true)}
                    onLeave={() => set_reveal(false)} />
                <box>
                    <label label={time("%H:%M")} />
                    <revealer
                        transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
                        transitionDuration={500}
                        reveal_child={reveal}>
                        <label label={time("%a, %d %B %Y")} />
                    </revealer>
                </box>
            </button>
        );
    }

    function AstalNetworkInfo() {
        const network = AstalNetwork.get_default();
        const wired = network.get_wired();
        const wifi = network.get_wifi();

        let [internet] = createState("disconnected");
        let [ssid, set_ssid] = createState<string | null>(null);
        let [icon] = createState("network-wireless-signal-none-symbolic");

        if (!wifi && !wired) {
            return (<></>);
        }

        if (network.primary === AstalNetwork.Primary.WIRED && wired) {
            set_ssid("Wired");

            icon = createComputed(
                [createBinding(wired, "icon_name")],
                icon_name => icon_name,
            );

            internet = createComputed(
                [createBinding(wired, "internet")],
                internet => get_internet_name(internet),
            );
        }

        else if (network.primary === AstalNetwork.Primary.WIFI && wifi) {
            ssid = createComputed(
                [createBinding(wifi, "active_access_point")],
                active_access_point => active_access_point ? active_access_point.get_ssid() : null,
            );

            icon = createComputed(
                [createBinding(wifi, "icon_name")],
                icon_name => icon_name,
            );

            internet = createComputed(
                [createBinding(wifi, "internet"), ssid],
                (internet, ssid) => {
                    if (!ssid) {
                        return "disconnected";
                    }

                    return get_internet_name(internet);
                },
            );
        }

        const [reveal, set_reveal] = createState(false);
        return (
            <button
                class="network">
                <Gtk.EventControllerMotion
                    onEnter={() => set_reveal(true)}
                    onLeave={() => set_reveal(false)} />
                <box>
                    <image
                        class={internet}
                        iconName={icon} />
                    <revealer
                        transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
                        transitionDuration={500}
                        reveal_child={reveal}>
                        <label label={ssid(ssid => ssid || "unknown")} />
                    </revealer>
                </box>
            </button>
        );
    }

    function AstalBatteryInfo() {
        const battery = AstalBattery.get_default();
        const brightness = Brightness.get_default();

        const [reveal, set_reveal] = createState(false);
        return (
            <button
                class="battery">
                <Gtk.EventControllerScroll
                    flags={Gtk.EventControllerScrollFlags.VERTICAL}
                    onScroll={(_1, _2, dy) => {
                        brightness.devices.forEach((device) => {
                            if (device.type == "backlight") {
                                device.percentage -= dy / 15;
                            }
                        });
                    }} />
                <Gtk.EventControllerMotion
                    onEnter={() => set_reveal(true)}
                    onLeave={() => set_reveal(false)} />

                <box>
                    <label label={createBinding(battery, "percentage").as(percentage => symbolic_strength(percentage, [" ", " ", " ", " ", " "], 1))} />
                    <revealer
                        transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
                        transitionDuration={500}
                        reveal_child={reveal}>
                        <label label={createBinding(battery, "percentage").as(percentage => `${(Math.floor(percentage * 100)).toString()}%`)} />
                    </revealer>
                </box>
            </button>
        );
    }

    return (
        <box
            class="info"
            spacing={10}>
            <Gtk.GestureClick
                button={Gdk.BUTTON_PRIMARY}
                onPressed={() => window_handler.toggle_window("glance", gdkmonitor)} />
            <AstalBatteryInfo />
            <AstalNetworkInfo />
            <TimeInfo />
        </box>
    );
}

function Power({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
    const [reveal, set_reveal] = createState(false);

    return (
        <button
            class="widget"
            onClicked={() => window_handler.toggle_window("powermenu", gdkmonitor)}>
            <Gtk.EventControllerMotion
                onEnter={() => set_reveal(true)}
                onLeave={() => set_reveal(false)} />
            <box
                class="power">
                <image iconName="system-log-out-symbolic" />
                <revealer
                    transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
                    transitionDuration={500}
                    revealChild={reveal}>
                    <label label="exit" />
                </revealer>
            </box>

        </button>
    );
}

export default function (gdkmonitor: Gdk.Monitor) {
    return (
        <window
            $={self => self.set_default_size(1, 1)}
            class="bar"
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
                    $type="start"
                    spacing={10}
                    halign={Gtk.Align.START}>
                    <Launcher />
                    <Workspaces />
                    <SysInfo />
                    <SysTray />
                </box>
                <box
                    $type="center"
                    spacing={10}
                    halign={Gtk.Align.CENTER}>
                    <Player gdkmonitor={gdkmonitor} />
                </box>
                <box
                    $type="end"
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
