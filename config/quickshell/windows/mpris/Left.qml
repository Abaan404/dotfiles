import QtQuick
import QtQuick.Effects
import QtQuick.Layouts
import QtQuick.Controls.impl 2.15

import Quickshell
import Quickshell.Widgets

import Services
import Colors
import Utils

WrapperRectangle {
    radius: 10

    color: Colors.secondary

    component ControlButton: WrapperMouseArea {
        id: button

        Layout.fillHeight: true
        Layout.fillWidth: true

        hoverEnabled: true
        resizeChild: false

        property string icon

        ColorImage {
            source: button.icon

            color: ColorHelper.mouse(Colors.text, button.containsMouse, button.containsPress)

            Behavior on color {
                ColorAnimation {
                    duration: 200
                    easing.type: Easing.OutCubic
                }
            }

            sourceSize {
                width: 15
                height: 15
            }
        }
    }

    RowLayout {
        spacing: 0

        ColumnLayout {
            spacing: 0

            Layout.preferredWidth: 50

            ControlButton {
                icon: Quickshell.iconPath("media-skip-backward-symbolic")

                onClicked: {
                    if (ActivePlayer.player?.canGoPrevious) {
                        ActivePlayer.player?.previous();
                    }
                }
            }

            ControlButton {
                icon: {
                    if (!ActivePlayer.player?.canPlay) {
                        return Quickshell.iconPath("media-playback-pause-symbolic");
                    }

                    if (!ActivePlayer.player?.isPlaying) {
                        return Quickshell.iconPath("media-playback-start-symbolic");
                    }

                    return Quickshell.iconPath("media-playback-pause-symbolic");
                }

                onClicked: {
                    if (ActivePlayer.player?.canTogglePlaying) {
                        ActivePlayer.player?.togglePlaying();
                    }
                }
            }

            ControlButton {
                icon: Quickshell.iconPath("media-skip-forward-symbolic")

                onClicked: {
                    if (ActivePlayer.player?.canGoNext) {
                        ActivePlayer.player?.next();
                    }
                }
            }
        }

        Item {
            Layout.preferredWidth: coverArt.implicitWidth || 150
            Layout.preferredHeight: 150

            ColorImage {
                id: fallback

                source: Quickshell.env("HOME") + "/.dotfiles/assets/playerart.png"

                anchors.fill: parent
                visible: coverArt.status !== Image.Ready
                color: Colors.text
                fillMode: Image.PreserveAspectFit

                sourceSize {
                    height: 150
                }
            }

            Image {
                id: coverArt
                source: ActivePlayer.player.trackArtUrl

                visible: false
                fillMode: Image.PreserveAspectFit

                sourceSize {
                    height: 150
                }
            }

            // https://forum.qt.io/topic/145956/rounded-image-in-qt6/6
            MultiEffect {
                source: coverArt
                anchors.fill: coverArt
                maskEnabled: true
                maskSource: mask
                maskSpreadAtMin: 1.0
                maskThresholdMin: 0.5
            }

            Item {
                id: mask
                anchors.fill: parent
                layer.enabled: true
                visible: false

                Rectangle {
                    anchors.fill: parent
                    radius: 10
                }
            }
        }
    }
}
