import Gtk from "gi://Gtk";
import Widget from "resource:///com/github/Aylur/ags/widget.js";

// services
import Mpris from "resource:///com/github/Aylur/ags/service/mpris.js";

// utils
import { new_window } from "../window.js";
import { player_selected, player_position } from "../variables.js";
import { get_player_glyph, to_timestamp } from "../utils.js";

const PlayerLeft = () => Widget.Box({
    class_name: "left",
    children: [
        Widget.Box({
            class_name: "image",
            setup: widget => {
                widget.hook(Mpris, widget => {
                    widget.css = `background: url('${Mpris.players[player_selected].cover_path}'); background-size: 180px 180px;`;
                }, "player-changed");
            },
        }),
        Widget.Box({
            class_name: "controls",
            orientation: Gtk.Orientation.VERTICAL,
            valign: Gtk.Align.FILL,
            spacing: 10,
            children: [
                Widget.Button({
                    class_name: "previous",
                    vexpand: true,
                    on_primary_click: () => {
                        if (player_selected < 0 || !Mpris.players[player_selected].can_go_prev)
                            return;

                        return Mpris.players[player_selected].previous();
                    },
                    child: Widget.Label(" "),
                }),
                Widget.Button({
                    class_name: "pause",
                    vexpand: true,
                    on_primary_click: () => {
                        if (player_selected < 0)
                            return;

                        return Mpris.players[player_selected].playPause();
                    },
                    child: Widget.Label().hook(Mpris, widget => {
                        widget.label = Mpris.players[player_selected].play_back_status == "Paused" ? " " : " ";
                    }),
                }),
                Widget.Button({
                    class_name: "next",
                    vexpand: true,
                    on_primary_click: () => {
                        if (player_selected < 0 || !Mpris.players[player_selected].can_go_next)
                            return;

                        return Mpris.players[player_selected].next();
                    },
                    child: Widget.Label(" "),
                }),
            ],
        }),
    ],
});

const PlayerRight = () => Widget.Box({
    class_name: "right",
    spacing: 10,
    orientation: Gtk.Orientation.VERTICAL,
    valign: Gtk.Align.FILL,
    children: [
        Widget.Label({
            class_name: "name",
            halign: Gtk.Align.START,
            valign: Gtk.Align.START,
            label: player_position.bind().transform(position => {
                const player = Mpris.players[player_selected];
                const track_position = to_timestamp(Math.round(<number>position * player.length));
                const track_length = to_timestamp(Math.round(player.length));

                if (player.length < 0)
                    return `${get_player_glyph(player.name)}  ${player.name}`;
                else
                    return `${get_player_glyph(player.name)}  ${player.name} (${track_position} / ${track_length})`;
            }),
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
                            if (player_selected < 0 || !Mpris.players[player_selected].track_title) {
                                widget.label = "No Title";
                                return;
                            }

                            let label = Mpris.players[player_selected].track_title;
                            if (label.length > 25)
                                label = `${label.slice(0, 25)}...`;

                            widget.label = label;
                        });
                    },
                }),
                Widget.Label({
                    class_name: "artist",
                    halign: Gtk.Align.START,
                    setup: widget => {
                        widget.hook(Mpris, widget => {
                            if (player_selected < 0 || Mpris.players[player_selected].track_artists.length == 0) {
                                widget.label = "No Artist";
                                return;
                            }

                            let label = Mpris.players[player_selected].track_artists.join(", ");
                            if (label.length > 35)
                                label = `${label.slice(0, 35)}...`;

                            widget.label = label;
                        });
                    },
                }),
                Widget.ProgressBar({
                    value: player_position.bind(),
                }),
            ],
        }),
    ],
});

export default () => new_window({
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
