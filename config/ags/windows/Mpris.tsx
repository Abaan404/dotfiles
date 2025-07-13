import App from "ags/gtk4/app";
import Gio from "gi://Gio";
import GLib from "gi://GLib";
import Adw from "gi://Adw";
import { Astal, Gdk, Gtk } from "ags/gtk4";
import { Accessor, createBinding, With } from "ags";

import AstalMpris from "gi://AstalMpris";
import ActivePlayer from "../services/activeplayer";

import { get_player_glyph, get_player_name, to_timestamp, truncate } from "../utils/helpers";

export default function (gdkmonitor: Gdk.Monitor) {
    const active_player = ActivePlayer.get_default();
    const player = createBinding(active_player, "player");

    return (
        <window
            $={self => self.set_default_size(-1, -1)}
            name="mpris"
            class="mpris"
            gdkmonitor={gdkmonitor}
            visible={true}
            anchor={Astal.WindowAnchor.TOP}
            application={App}>
            <box
                class="layout-box"
                halign={Gtk.Align.CENTER}
                spacing={10}>
                <box
                    class="left">
                    <box
                        class="controls"
                        spacing={10}
                        orientation={Gtk.Orientation.VERTICAL}>
                        <button
                            class="previous"
                            vexpand={true}
                            onClicked={() => {
                                const player = active_player.player;

                                if (player?.get_can_go_previous()) {
                                    player?.previous();
                                }
                            }}>
                            <image iconName="media-skip-backward-symbolic" />
                        </button>
                        <button
                            class="pause"
                            vexpand={true}
                            onClicked={() => {
                                const player = active_player.player;

                                if (player?.get_can_play()) {
                                    player?.play_pause();
                                }
                            }}>
                            <With value={player}>
                                {(player) => {
                                    if (!player) {
                                        return (
                                            <image iconName="media-playback-pause-symbolic" />
                                        );
                                    }

                                    return (
                                        <image iconName={createBinding(player, "playback_status").as(playback_status =>
                                            playback_status === AstalMpris.PlaybackStatus.PLAYING
                                                ? "media-playback-pause-symbolic"
                                                : "media-playback-start-symbolic",
                                        )} />
                                    );
                                }}
                            </With>
                        </button>
                        <button
                            class="next"
                            vexpand={true}
                            onClicked={() => {
                                const player = active_player.player;

                                if (player?.get_can_go_next()) {
                                    player?.next();
                                }
                            }}>
                            <image iconName="media-skip-forward-symbolic" />
                        </button>
                    </box>
                    <Adw.Clamp
                        orientation={Gtk.Orientation.VERTICAL}
                        maximumSize={150}>
                        <With value={player}>
                            {(player) => {
                                if (!player) {
                                    return (
                                        <Gtk.Picture
                                            file={Gio.File.new_for_path(GLib.get_user_config_dir() + "/ags/assets/playerart.png")} />
                                    );
                                }

                                return (
                                    <Gtk.Picture file={createBinding(player, "cover_art").as((cover_art) => {
                                        const file = Gio.File.new_for_path(cover_art);
                                        if (!file.query_exists(null)) {
                                            return Gio.File.new_for_path(GLib.get_user_config_dir() + "/ags/assets/playerart.png");
                                        }

                                        return file;
                                    })} />
                                );
                            }}
                        </With>
                    </Adw.Clamp>
                </box>
                <box
                    class="right"
                    spacing={10}
                    orientation={Gtk.Orientation.VERTICAL}>
                    <With value={player}>
                        {(player) => {
                            if (!player) {
                                return (
                                    <box
                                        spacing={10}>
                                        <label label={`${get_player_glyph("")}  No players`} />
                                    </box>
                                );
                            }

                            return (
                                <button
                                    class="active-player-control"
                                    onClicked={() => active_player.next_player()}>
                                    <Gtk.GestureClick
                                        button={Gdk.BUTTON_SECONDARY}
                                        onPressed={() => active_player.prev_player()} />
                                    <box
                                        spacing={10}>
                                        <label label={`${get_player_glyph(player.get_bus_name())}  ${get_player_name(player.get_bus_name())}`} />
                                        <label label={createBinding(player, "position").as(position => player.get_length() > 0 ? `(${to_timestamp(position)} / ${to_timestamp(player.get_length())})` : `(${to_timestamp(position)})`)} />
                                    </box>
                                </button>
                            );
                        }}
                    </With>
                    <With value={player}>
                        {(player) => {
                            if (!player) {
                                return (
                                    <box
                                        orientation={Gtk.Orientation.VERTICAL}
                                        valign={Gtk.Align.CENTER}
                                        vexpand={true}>
                                        <label
                                            class="title"
                                            halign={Gtk.Align.START}
                                            label="No Title" />
                                        <label
                                            class="artist"
                                            halign={Gtk.Align.START}
                                            label="No Artist" />
                                        <slider min={0} max={1} value={0} />
                                    </box>
                                );
                            }

                            return (
                                <box
                                    orientation={Gtk.Orientation.VERTICAL}
                                    valign={Gtk.Align.CENTER}
                                    vexpand={true}>
                                    <label
                                        class="title"
                                        halign={Gtk.Align.START}
                                        label={createBinding(player, "title").as(title => title === "" ? "No Title" : truncate(title, 50))} />
                                    <label
                                        class="artist"
                                        halign={Gtk.Align.START}
                                        label={createBinding(player, "artist").as(artist => artist === "" ? "No Artist" : truncate(artist, 50))} />
                                    <slider
                                        min={0}
                                        max={1}
                                        value={createBinding(player, "position").as(position => position / player.get_length())}
                                        onChangeValue={(self) => {
                                            const player = active_player.player;
                                            if (!player || !player.get_can_seek()) {
                                                return;
                                            }

                                            player.set_position(self.get_value() * player.get_length());
                                        }} />
                                </box>
                            );
                        }}
                    </With>
                </box>
            </box>
        </window>
    ) as Astal.Window;
}
