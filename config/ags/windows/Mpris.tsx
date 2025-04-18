import { App, Astal, Gdk, Gtk } from "astal/gtk4";
import { bind, Gio, GLib } from "astal";

import AstalMpris from "gi://AstalMpris";
import ActivePlayer from "../services/activeplayer";

import { Picture } from "../utils/widgets";

import { MouseButton } from "../utils/inputs";
import { get_player_glyph, get_player_name } from "../utils/strings";
import { to_timestamp, truncate } from "../utils/strings";

export default function (gdkmonitor: Gdk.Monitor) {
    const active_player = ActivePlayer.get_default();

    return (
        <window
            setup={self => self.set_default_size(-1, -1)}
            name="mpris"
            cssClasses={["mpris"]}
            gdkmonitor={gdkmonitor}
            visible={true}
            anchor={Astal.WindowAnchor.TOP}
            application={App}>
            <box
                cssClasses={["layout-box"]}
                halign={Gtk.Align.CENTER}
                spacing={10}>
                <box
                    cssClasses={["left"]}>
                    {bind(active_player, "player").as((player) => {
                        if (!player) {
                            return <Picture file={Gio.File.new_for_path(GLib.get_user_config_dir() + "/ags/assets/playerart.png")} />;
                        }

                        return (
                            <Picture file={bind(player, "cover_art").as((cover_art) => {
                                const file = Gio.File.new_for_path(cover_art);
                                if (!file.query_exists(null)) {
                                    return Gio.File.new_for_path(GLib.get_user_config_dir() + "/ags/assets/playerart.png");
                                }

                                return file;
                            })} />
                        );
                    })}
                    <box
                        cssClasses={["controls"]}
                        spacing={10}
                        orientation={Gtk.Orientation.VERTICAL}>
                        <button
                            cssClasses={["previous"]}
                            vexpand={true}
                            onButtonPressed={(_, e) => {
                                const player = active_player.player;
                                if (!player) {
                                    return;
                                }

                                switch (e.get_button()) {
                                    case MouseButton.PRIMARY:
                                        if (player.get_can_go_previous()) {
                                            player.previous();
                                        }
                                        break;

                                    default:
                                        break;
                                }
                            }}>
                            <image iconName="media-skip-backward-symbolic" />
                        </button>
                        <button
                            cssClasses={["pause"]}
                            vexpand={true}
                            onButtonPressed={(_, e) => {
                                const player = active_player.player;
                                if (!player) {
                                    return;
                                }

                                switch (e.get_button()) {
                                    case MouseButton.PRIMARY:
                                        if (player.get_can_play() && player.get_can_pause()) {
                                            player.play_pause();
                                        }
                                        break;

                                    default:
                                        break;
                                }
                            }}>
                            {bind(active_player, "player").as((player) => {
                                if (!player) {
                                    return (
                                        <image iconName="media-playback-pause-symbolic" />
                                    );
                                }

                                return (
                                    <image iconName={bind(player, "playback_status").as(playback_status =>
                                        playback_status === AstalMpris.PlaybackStatus.PLAYING
                                            ? "media-playback-pause-symbolic"
                                            : "media-playback-start-symbolic",
                                    )} />
                                );
                            })}
                        </button>
                        <button
                            cssClasses={["next"]}
                            vexpand={true}
                            onButtonPressed={(_, e) => {
                                const player = active_player.player;
                                if (!player) {
                                    return;
                                }

                                switch (e.get_button()) {
                                    case MouseButton.PRIMARY:
                                        if (player.get_can_go_next()) {
                                            player.next();
                                        }
                                        break;

                                    default:
                                        break;
                                }
                            }}>
                            <image iconName="media-skip-forward-symbolic" />
                        </button>
                    </box>
                </box>
                <box
                    cssClasses={["right"]}
                    spacing={10}
                    orientation={Gtk.Orientation.VERTICAL}>
                    {bind(active_player, "player").as((player) => {
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
                                cssClasses={["active-player-control"]}
                                onButtonPressed={(_, e) => {
                                    switch (e.get_button()) {
                                        case MouseButton.PRIMARY:
                                            active_player.next_player();
                                            break;

                                        case MouseButton.SECONDARY:
                                            active_player.prev_player();
                                            break;

                                        default:
                                            break;
                                    }
                                }}>
                                <box
                                    spacing={10}>
                                    <label label={`${get_player_glyph(player.get_bus_name())}  ${get_player_name(player.get_bus_name())}`} />
                                    <label label={bind(player, "position").as(position => player.get_length() > 0 ? `(${to_timestamp(position)} / ${to_timestamp(player.get_length())})` : `(${to_timestamp(position)})`)} />
                                </box>
                            </button>
                        );
                    })}
                    <box
                        orientation={Gtk.Orientation.VERTICAL}
                        valign={Gtk.Align.CENTER}
                        vexpand={true}>
                        {bind(active_player, "player").as((player) => {
                            if (!player) {
                                return [
                                    <label
                                        cssClasses={["title"]}
                                        halign={Gtk.Align.START}
                                        label="No Title" />,
                                    <label
                                        cssClasses={["artist"]}
                                        halign={Gtk.Align.START}
                                        label="No Artist" />,
                                ];
                            }

                            return [
                                <label
                                    cssClasses={["title"]}
                                    halign={Gtk.Align.START}
                                    label={bind(player, "title").as(title => title === "" ? "No Title" : truncate(title, 50))} />,
                                <label
                                    cssClasses={["artist"]}
                                    halign={Gtk.Align.START}
                                    label={bind(player, "artist").as(artist => artist === "" ? "No Artist" : truncate(artist, 50))} />,
                            ];
                        })}
                        {bind(active_player, "player").as((player) => {
                            if (!player) {
                                return <slider min={0} max={1} value={0} />;
                            }

                            return (
                                <slider
                                    min={0}
                                    max={1}
                                    value={bind(player, "position").as(position => position / player.get_length())}
                                    onChangeValue={(self) => {
                                        const player = active_player.player;
                                        if (!player || !player.get_can_seek()) {
                                            return;
                                        }

                                        player.set_position(self.get_value() * player.get_length());
                                    }} />
                            );
                        })}
                    </box>
                </box>
            </box>
        </window>
    ) as Astal.Window;
}
