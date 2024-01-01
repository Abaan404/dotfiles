import Variable from "resource:///com/github/Aylur/ags/variable.js";

// services
import Mpris from "resource:///com/github/Aylur/ags/service/mpris.js";

const ignored_bus_names = ["org.mpris.MediaPlayer2.playerctld"];
export let player_selected = -1;

Mpris.connect("player-added", (Mpris, bus_name) => {
    if (ignored_bus_names.includes(bus_name))
        return;

    player_selected = Mpris.players.length - 1;
});
Mpris.connect("player-changed", (Mpris, bus_name) => {
    if (ignored_bus_names.includes(bus_name))
        return;

    return player_selected = Mpris.players.findIndex(player => player.bus_name === bus_name);
});
Mpris.connect("player-closed", (_, bus_name) => {
    if (ignored_bus_names.includes(bus_name))
        return;

    return player_selected--;
});

// todo figure out MprisPlayer "position" signal once the wiki isnt 404 anymore
export const player_position = Variable(0, {
    poll: [999, () => {
        if (player_selected < 0 || !Mpris.players[player_selected])
            return 0;

        return (Mpris.players[player_selected].position / Mpris.players[player_selected].length);
    }],
});
