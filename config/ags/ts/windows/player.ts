import Gtk from "gi://Gtk";
import App from "resource:///com/github/Aylur/ags/app.js";
import WindowHandler from "../window.js";
import * as Widget from "resource:///com/github/Aylur/ags/widget.js";
import * as Variables from "../variables.js";
import { get_player_glyph, to_timestamp, truncate } from "../utils.js";

import Mpris from "resource:///com/github/Aylur/ags/service/mpris.js";

const PlayerLeft = () => Widget.Box({
    class_name: "left",
    children: [
        Widget.Box({
            class_name: "image",
            setup: widget => {
                widget.hook(Mpris, widget => {
                    if (Variables.PlayerSelected.value < 0 || !Mpris.players[Variables.PlayerSelected.value].cover_path)
                        widget.css = `background: url('${App.configDir + "/assets/playerart.png"}'); background-size: 180px 180px;`;
                    else
                        widget.css = `background: url('${Mpris.players[Variables.PlayerSelected.value].cover_path}'); background-size: 180px 180px;`;
                }, "player-changed");
            },
        }),
        Widget.Box({
            class_name: "controls",
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 10,
            children: [
                Widget.Button({
                    class_name: "previous",
                    vexpand: true,
                    on_primary_click: () => {
                        if (Variables.PlayerSelected.value < 0 || !Mpris.players[Variables.PlayerSelected.value].can_go_prev)
                            return;

                        Mpris.players[Variables.PlayerSelected.value].previous();
                    },
                    child: Widget.Icon({ icon: "media-skip-backward-symbolic" }),
                }),
                Widget.Button({
                    class_name: "pause",
                    vexpand: true,
                    on_primary_click: () => {
                        if (Variables.PlayerSelected.value < 0 || !Mpris.players[Variables.PlayerSelected.value].can_play)
                            return;

                        Mpris.players[Variables.PlayerSelected.value].playPause();
                    },
                    child: Widget.Icon().hook(Mpris, widget => {
                        widget.icon = Mpris.players[Variables.PlayerSelected.value]?.play_back_status === "Paused" ? "media-playback-start-symbolic" : "media-playback-pause-symbolic";
                    }, "player-changed"),
                }),
                Widget.Button({
                    class_name: "next",
                    vexpand: true,
                    on_primary_click: () => {
                        if (Variables.PlayerSelected.value < 0 || !Mpris.players[Variables.PlayerSelected.value].can_go_next)
                            return;

                        Mpris.players[Variables.PlayerSelected.value].next();
                    },
                    child: Widget.Icon({ icon: "media-skip-forward-symbolic" }),
                }),
            ],
        }),
    ],
});

const PlayerRight = () => Widget.Box({
    class_name: "right",
    spacing: 10,
    orientation: Gtk.Orientation.VERTICAL,
    children: [
        Widget.Label({
            class_name: "name",
            halign: Gtk.Align.START,
            valign: Gtk.Align.START,
        }).poll(1000, widget => {
            if (Variables.PlayerSelected.value < 0) {
                widget.label = `${get_player_glyph("")}  No players`;
                return;
            }

            const player = Mpris.players[Variables.PlayerSelected.value];
            if (player.length < 0)
                widget.label = `${get_player_glyph(player.name)}  ${player.name}`;
            else
                widget.label = `${get_player_glyph(player.name)}  ${player.name} (${to_timestamp(player.position)} / ${to_timestamp(player.length)})`;
        }),
        Widget.Box({
            orientation: Gtk.Orientation.VERTICAL,
            valign: Gtk.Align.CENTER,
            vexpand: true,
            children: [
                Widget.Label({
                    class_name: "title",
                    halign: Gtk.Align.START,
                    setup: widget => {
                        widget.hook(Mpris, widget => {
                            if (Variables.PlayerSelected.value < 0 || !Mpris.players[Variables.PlayerSelected.value].track_title) {
                                widget.label = "No Title";
                                return;
                            }

                            widget.label = truncate(Mpris.players[Variables.PlayerSelected.value].track_title, 28);
                        });
                    },
                }),
                Widget.Label({
                    class_name: "artist",
                    halign: Gtk.Align.START,
                    setup: widget => {
                        widget.hook(Mpris, widget => {
                            if (Variables.PlayerSelected.value < 0 ||
                                !Mpris.players[Variables.PlayerSelected.value].track_artists.length ||
                                !Mpris.players[Variables.PlayerSelected.value].track_artists[0].length) {
                                widget.label = "No Artist";
                                return;
                            }

                            widget.label = truncate(Mpris.players[Variables.PlayerSelected.value].track_artists.join(", "), 38);
                        });
                    },
                }),
                Widget.ProgressBar().poll(1000, widget => {
                    if (Variables.PlayerSelected.value < 0)
                        return 0;

                    const player = Mpris.players[Variables.PlayerSelected.value];
                    widget.value = player.position / player.length;
                }),
            ],
        }),
    ],
});

export default () => WindowHandler.new_window({
    class_name: "player",
    window: {
        anchor: ["top"],
    },
    box: {
        spacing: 10,
    },
    children: [
        PlayerLeft(),
        PlayerRight(),
    ],
});
