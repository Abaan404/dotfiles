import { App, Astal, Gdk, Gtk, Widget } from "astal/gtk3";
import { GLib, Variable } from "astal";

import Mpris from "gi://AstalMpris";

import { BoxedWindow } from "../widgets/BoxedWindow";
import { ProgressBar } from "../widgets/ProgressBar";
import { PlayerSelected } from "../helpers/variables";
import { get_player_glyph, get_player_name } from "../utils/glyphs";
import { to_timestamp } from "../utils/strings";

export default function (gdkmonitor: Gdk.Monitor) {
    const PlayerSelectedProgress = Variable(0.0);

    PlayerSelectedProgress.set(PlayerSelected.get()?.get_position() || 0.0);

    PlayerSelected.get()?.connect("notify", (player) => {
        PlayerSelectedProgress.set(player.get_position());
    });

    PlayerSelected.subscribe((player) => {
        player?.connect("notify", (player) => {
            PlayerSelectedProgress.set(player.get_position());
        });
    });

    return (
        <BoxedWindow
            name="mpris"
            gdkmonitor={gdkmonitor}
            anchor={Astal.WindowAnchor.TOP}
            application={App}
            layout_box_props={{
                spacing: 10,
            }}>

            <box
                className="left">
                <box
                    className="image"
                    css={PlayerSelected().as((player) => {
                        const cover_path = player
                            ? player.get_cover_art()
                            : `${GLib.get_user_config_dir()}/ags/assets/playerart.png`;

                        return `background-image: url('${cover_path}'); background-size: 180px 180px;`;
                    })}>
                </box>
                <box
                    className="controls"
                    spacing={10}
                    orientation={Gtk.Orientation.VERTICAL}>
                    <button
                        className="previous"
                        vexpand={true}
                        onClick={(_, e) => {
                            const player = PlayerSelected.get();
                            if (!player) {
                                return;
                            }

                            switch (e.button) {
                                case Astal.MouseButton.PRIMARY:
                                    if (player.get_can_go_previous()) {
                                        player.previous();
                                    }
                                    break;

                                default:
                                    break;
                            }
                        }}>
                        <icon icon="media-skip-backward-symbolic" />
                    </button>
                    <button
                        className="pause"
                        vexpand={true}
                        onClick={(_, e) => {
                            const player = PlayerSelected.get();
                            if (!player) {
                                return;
                            }

                            switch (e.button) {
                                case Astal.MouseButton.PRIMARY:
                                    if (player.get_can_play() && player.get_can_pause()) {
                                        player.play_pause();
                                    }
                                    break;

                                default:
                                    break;
                            }
                        }}>
                        <icon icon={PlayerSelected().as(player =>
                            player?.playback_status == Mpris.PlaybackStatus.PLAYING
                                ? "media-playback-pause-symbolic"
                                : "media-playback-start-symbolic",
                        )} />
                    </button>
                    <button
                        className="next"
                        vexpand={true}
                        onClick={(_, e) => {
                            const player = PlayerSelected.get();
                            if (!player) {
                                return;
                            }

                            switch (e.button) {
                                case Astal.MouseButton.PRIMARY:
                                    if (player.get_can_go_next()) {
                                        player.next();
                                    }
                                    break;

                                default:
                                    break;
                            }
                        }}>
                        <icon icon="media-skip-forward-symbolic" />
                    </button>
                </box>
            </box>
            <box
                className="right"
                spacing={10}
                orientation={Gtk.Orientation.VERTICAL}>
                <label
                    className="name"
                    valign={Gtk.Align.START}
                    halign={Gtk.Align.START}
                    label={Variable.derive([PlayerSelected(), PlayerSelectedProgress()], (player, progress) => {
                        if (!player) {
                            return `${get_player_glyph("")}  No players`;
                        }

                        if (player.length < 0) {
                            return `${get_player_glyph(player.get_bus_name())}  ${get_player_name(player.get_bus_name())}`;
                        }
                        else {
                            return `${get_player_glyph(player.get_bus_name())}  ${get_player_name(player.get_bus_name())} (${to_timestamp(progress)} / ${to_timestamp(player.get_length())})`;
                        }
                    })()} />
                <box
                    orientation={Gtk.Orientation.VERTICAL}
                    valign={Gtk.Align.CENTER}
                    vexpand={true}>
                    <label
                        className="title"
                        halign={Gtk.Align.START}
                        label={PlayerSelected().as((player) => {
                            if (!player || player.get_title() == "") {
                                return "No Title";
                            }

                            return player.get_title();
                        })} />
                    <label
                        className="artist"
                        halign={Gtk.Align.START}
                        label={PlayerSelected().as((player) => {
                            if (!player || player.get_artist() == "") {
                                return "No Artist";
                            }

                            return player.get_artist();
                        })} />
                    <ProgressBar
                        fraction={
                            Variable.derive([PlayerSelected(), PlayerSelectedProgress()], (player, progress) => {
                                if (!player) {
                                    return 0.0;
                                }

                                return progress / player.get_length();
                            })()
                        }>
                    </ProgressBar>
                </box>
            </box>
        </BoxedWindow>
    ) as Widget.Window;
}
