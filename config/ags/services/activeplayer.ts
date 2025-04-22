import GObject, { register, property } from "astal/gobject";

import AstalMpris from "gi://AstalMpris";

@register({ GTypeName: "ActivePlayer" })
export default class ActivePlayer extends GObject.Object {
    static instance: ActivePlayer;

    static get_default() {
        if (!this.instance)
            this.instance = new ActivePlayer();

        return this.instance;
    }

    private mpris: AstalMpris.Mpris = AstalMpris.get_default();
    private readonly ignored_bus_names: string[] = [
        "org.mpris.MediaPlayer2.playerctld",
    ];

    private _players: AstalMpris.Player[] = [];
    private _active_player = 0;

    @property(AstalMpris.Player) declare position: number;
    @property(AstalMpris.Player) get player() {
        if (this._players.length <= 0) {
            return null;
        }

        return this._players[this._active_player] ?? null;
    }

    next_player() {
        this._active_player++;

        if (this._active_player >= this._players.length) {
            this._active_player = 0;
        }

        this.notify("player");
    }

    prev_player() {
        this._active_player--;

        if (this._active_player < 0) {
            this._active_player = this._players.length - 1;
        }

        this.notify("player");
    }

    constructor() {
        super();

        this.mpris.get_players()
            .sort((p1, p2) => {
                // always keep spotify as the last element in the array
                if (p1.get_bus_name() === "org.mpris.MediaPlayer2.spotify") {
                    return 1;
                }

                if (p2.get_bus_name() === "org.mpris.MediaPlayer2.spotify") {
                    return -1;
                }

                return 0;
            })
            .forEach((player) => {
                if (this.ignored_bus_names.includes(player.get_bus_name())) {
                    return;
                }

                this._players.unshift(player);
                this.notify("player");
            });

        this.mpris.connect_after("player-added", (_, player) => {
            if (this.ignored_bus_names.includes(player.get_bus_name())) {
                return;
            }

            this._players.unshift(player);
            this.notify("player");
        });

        this.mpris.connect_after("player-closed", (_, player) => {
            const idx = this._players.findIndex(p => p.get_bus_name() === player.get_bus_name());
            if (idx !== -1) {
                this._players.splice(idx, 1);
                this.notify("player");
            }
        });
    }
}
