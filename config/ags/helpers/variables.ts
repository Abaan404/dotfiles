import { Variable } from "astal";
import AstalMpris from "gi://AstalMpris";

export const PlayerSelected: Variable<AstalMpris.Player | undefined> = Variable(undefined);

const mpris = AstalMpris.get_default();
const ignored_bus_names: string[] = ["org.mpris.MediaPlayer2.playerctld"];
const player_prev_map = new Map<string, [AstalMpris.PlaybackStatus, string]>();

mpris.get_players().reverse().forEach((player) => {
    if (!PlayerSelected.get() && !ignored_bus_names.includes(player.get_bus_name())) {
        PlayerSelected.set(player);
    }

    player_prev_map.set(player.get_bus_name(), [player.get_playback_status(), player.get_title() + player.get_artist()]);

    player.connect("notify", (self) => {
        if (ignored_bus_names.includes(self.get_bus_name())) {
            return;
        }

        const prev = player_prev_map.get(self.get_bus_name());
        if (!prev) {
            return;
        }

        const [prev_playback_status, prev_title] = prev;
        const current_playback_status = self.get_playback_status();
        const current_title = self.get_title();

        if (prev_playback_status !== current_playback_status || prev_title !== current_title) {
            player_prev_map.set(self.get_bus_name(), [current_playback_status, current_title]);
            PlayerSelected.set(self);
            // @ts-ignore: HACK forcing private member variable to emit a changed signal even if its the same value
            PlayerSelected.variable.emit("changed");
        }
    });
});

mpris.connect("player-added", (_, player) => {
    player_prev_map.set(player.get_bus_name(), [player.get_playback_status(), player.get_title() + player.get_artist()]);

    player.connect("notify", (self) => {
        if (ignored_bus_names.includes(self.get_bus_name())) {
            return;
        }

        const prev = player_prev_map.get(self.get_bus_name());
        if (!prev) {
            return;
        }

        const [prev_playback_status, prev_title] = prev;
        const current_playback_status = self.get_playback_status();
        const current_title = self.get_title();

        if (prev_playback_status !== current_playback_status || prev_title !== current_title) {
            player_prev_map.set(self.get_bus_name(), [current_playback_status, current_title]);
            PlayerSelected.set(self);
            // @ts-ignore: HACK forcing private member variable to emit a changed signal even if its the same value
            PlayerSelected.variable.emit("changed");
        }
    });
});

mpris.connect("player-closed", (self, player) => {
    player_prev_map.delete(player.get_bus_name());

    const remaining_players = self.get_players().reverse();
    const new_player = remaining_players.find(player =>
        PlayerSelected.get() !== player && !ignored_bus_names.includes(player.get_bus_name()),
    );

    if (new_player) {
        PlayerSelected.set(new_player);
    }
    else {
        PlayerSelected.set(undefined);
    }
});
