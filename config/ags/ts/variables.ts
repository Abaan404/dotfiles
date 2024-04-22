import Variable from "resource:///com/github/Aylur/ags/variable.js";

import Recorder from "./services/recorder.js";
import Mpris from "resource:///com/github/Aylur/ags/service/mpris.js";
import Battery from "resource:///com/github/Aylur/ags/service/battery.js";

const ignored_bus_names = ["org.mpris.MediaPlayer2.playerctld"];
export const PlayerSelected = Variable(-1);

Mpris.connect("player-added", (Mpris, bus_name) => {
    if (ignored_bus_names.includes(bus_name))
        return;

    PlayerSelected.value = Mpris.players.length - 1;
});
Mpris.connect("player-changed", (Mpris, bus_name) => {
    if (ignored_bus_names.includes(bus_name))
        return;

    PlayerSelected.value = Mpris.players.findIndex(player => player.bus_name === bus_name);
});
Mpris.connect("player-closed", () => {
    PlayerSelected.value--;

    while (ignored_bus_names.includes(Mpris.players[PlayerSelected.value].bus_name))
        PlayerSelected.value--;

    if (PlayerSelected.value < 0)
        for (let i = 0; i < Mpris.players.length; i++)
            if (!ignored_bus_names.includes(Mpris.players[i].bus_name)) {
                PlayerSelected.value = i;
                return;
            }
});

// Pause replay on battery
Battery.connect("changed", () => {
    if ((Battery.charged || Battery.charging) && Recorder.is_replay_paused ||
        !(Battery.charged || Battery.charging) && !Recorder.is_replay_paused) {
        Recorder.replay_playpause();
    }
});
