import QtQuick
import QtQuick.Layouts
import QtQuick.Controls

import Quickshell.Widgets
import Quickshell.Services.Mpris

import Services
import Colors
import Utils

ColumnLayout {
    spacing: 0

    WrapperMouseArea {
        id: mouseArea

        hoverEnabled: true

        onClicked: ActivePlayer.nextPlayer()

        property color color: {
            if (mouseArea.containsMouse && !mouseArea.containsPress) {
                return Qt.lighter(Colors.text, 1.2);
            }

            return Colors.text;
        }

        RowLayout {
            spacing: 10

            Text {
                text: {
                    let glyph = "";

                    switch (ActivePlayer.player?.identity) {
                    case "Mozilla zen-twilight":
                        glyph = "";
                        break;
                    case "Spotify":
                        glyph = "";
                        break;
                    default:
                        break;
                    }

                    return `${glyph}  ${ActivePlayer.player?.identity ?? "Unknown"}`;
                }

                color: mouseArea.color

                font {
                    pixelSize: 14
                    weight: Font.ExtraBold
                }

                Behavior on color {
                    ColorAnimation {
                        duration: 200
                        easing.type: Easing.OutCubic
                    }
                }
            }

            Text {
                text: {
                    if (!ActivePlayer.player?.lengthSupported) {
                        return `(${StringsHelper.toTimestamp(ActivePlayer.player?.position ?? 0)})`;
                    }

                    return `(${StringsHelper.toTimestamp(ActivePlayer.player?.position ?? 0)} / ${StringsHelper.toTimestamp(ActivePlayer.player?.length ?? 0)})`;
                }

                color: mouseArea.color

                font {
                    pixelSize: 14
                    weight: Font.ExtraBold
                }

                Behavior on color {
                    ColorAnimation {
                        duration: 200
                        easing.type: Easing.OutCubic
                    }
                }
            }
        }
    }

    Text {
        text: StringsHelper.truncate(ActivePlayer.player?.trackTitle, 30) ?? "No Title"
        color: Colors.text
        topPadding: 5

        font {
            pixelSize: 38
            weight: Font.ExtraBold
        }
    }

    Text {
        text: StringsHelper.truncate(ActivePlayer.player?.trackArtist, 30) ?? "No Artist"
        color: Colors.text
        bottomPadding: 10

        font {
            pixelSize: 22
            weight: Font.Bold
        }
    }

    Slider {
        id: control
        implicitHeight: 7

        Layout.fillWidth: true
        Layout.alignment: Qt.AlignBottom

        handle: Item {}

        background: Rectangle {
            radius: 10
            color: Colors.secondary

            Rectangle {
                width: control.visualPosition * parent.width
                height: parent.height
                color: Colors.text
                radius: 10
            }
        }

        onPressedChanged: {
            // still dragging, ignore
            if (pressed) {
                return;
            }

            if (!ActivePlayer.player?.lengthSupported || !ActivePlayer.player?.canControl) {
                return;
            }

            ActivePlayer.player.position = ActivePlayer.player.length * value;
        }

        value: {
            // still dragging, ignore
            if (pressed) {
                return value;
            }

            if (!ActivePlayer.player?.lengthSupported) {
                return 1.0;
            }

            return ActivePlayer.player?.position / ActivePlayer.player?.length;
        }
    }

    FrameAnimation {
        // only emit the signal when the position is actually changing.
        running: ActivePlayer.player?.playbackState == MprisPlaybackState.Playing
        // emit the positionChanged signal every frame.
        onTriggered: ActivePlayer.player?.positionChanged()
    }
}
