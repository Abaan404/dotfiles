import QtQuick
import QtQuick.Layouts

import Services
import Utils

import qs.windows.bar

BarItem {
    onClicked: event => {
        if (event.button === Qt.MiddleButton && ActivePlayer.player?.canTogglePlaying) {
            ActivePlayer.player?.togglePlaying();
        }

        if (event.button === Qt.RightButton && ActivePlayer.player?.canGoNext) {
            ActivePlayer.player?.next();
        }

        if (event.button === Qt.LeftButton) {
            WindowState.toggle("mpris")
        }
    }

    onWheel: event => {
        const volume = ActivePlayer.player.volume + event.angleDelta.y / 1000;
        ActivePlayer.player.volume = MathHelper.clamp(volume, 0, 1);
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

                return `${StringsHelper.truncate(ActivePlayer.player?.trackTitle, 30) ?? ""} - ${StringsHelper.truncate(ActivePlayer.player?.trackArtist, 30) ?? "No Artist"}`;
            }
        }
    }
}
