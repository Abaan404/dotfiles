pragma Singleton

import QtQuick

import Quickshell
import Quickshell.Services.Mpris

Singleton {
    id: root

    QtObject {
        id: internal

        readonly property list<string> ignoredBusNames: ["org.mpris.MediaPlayer2.playerctld",]

        property list<MprisPlayer> players: []
        property int activeIndex: 0

        function rebuildPlayers() {
        // qmlformat off
        players = Mpris.players.values
            .filter(p => !ignoredBusNames.includes(p.dbusName))
            .sort((p1, p2) => {
                // always keep spotify as the first element in the array
                if (p1.dbusName === "org.mpris.MediaPlayer2.spotify") {
                    return -1;
                }

                if (p2.dbusName === "org.mpris.MediaPlayer2.spotify") {
                    return 1;
                }

                return 0;
            });
        // qmlformat on

            if (activeIndex >= players.length) {
                activeIndex = Math.max(0, players.length - 1);
            }
        }
    }

    readonly property MprisPlayer player: internal.players[internal.activeIndex] ?? null

    function nextPlayer() {
        internal.activeIndex++;
        if (internal.activeIndex >= internal.players.length) {
            internal.activeIndex = 0;
        }
    }

    function prevPlayer() {
        internal.activeIndex--;
        if (internal.activeIndex < 0) {
            internal.activeIndex = internal.players.length - 1;
        }
    }

    Component.onCompleted: {
        internal.rebuildPlayers();
    }

    Connections {
        target: Mpris.players
        function onValuesChanged() {
            internal.rebuildPlayers();
        }
    }
}
