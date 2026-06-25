import QtQuick
import QtQuick.Layouts

import Quickshell.Io

import Services

import ".."
import "../../../utils/helpers.js" as Utils

BarItem {
    onClicked: event => {
        if (event.button === Qt.RightButton) {
            ActivePlayer.nextPlayer();
        }

        if (event.button === Qt.LeftButton) {
            agsProc.running = true;
        }
    }

    onWheel: event => {
        const volume = ActivePlayer.player.volume + event.angleDelta.y / 1000;
        ActivePlayer.player.volume = Utils.clamp(volume, 0, 1);
    }

    RowLayout {
        spacing: 14

        BarText {
            text: {
                switch (ActivePlayer.player?.identity) {
                case "Mozilla zen-twilight":
                    return "";
                case "Spotify":
                    return "";
                default:
                    return "";
                }
            }
        }

        BarText {
            text: {
                if (!ActivePlayer.player) {
                    return "No Title";
                }

                return `${Utils.truncate(ActivePlayer.player?.trackTitle, 30) ?? ""} - ${Utils.truncate(ActivePlayer.player?.trackArtist, 30) ?? "No Artist"}`;
            }
        }
    }

    Process {
        id: agsProc
        command: ["ags", "request", "window mpris"]
    }
}
