import QtQuick
import QtQuick.Layouts

import Quickshell
import Quickshell.Widgets

import Colors
import Services

import qs.windows
import qs.windows.menus

PanelWindow { // qmllint disable uncreatable-type
    visible: false
    color: "transparent"
    implicitWidth: 450
    implicitHeight: 510

    exclusionMode: ExclusionMode.Ignore

    mask: Region {
        regions: [replayButton.region, recordButton.region, muteButton.region, pauseButton.region]
    }

    anchors {
        left: true
    }

    Component.onCompleted: {
        WindowState.register("replay", this);
    }

    WrapperItem {
        leftMargin: parent.visible ? 40 : -40

        Behavior on leftMargin {
            NumberAnimation {
                duration: 400
                easing.type: Easing.OutBack
            }
        }

        anchors {
            verticalCenter: parent.verticalCenter
            left: parent.left
        }

        ColumnLayout {
            spacing: 30

            RowLayout {
                spacing: 30

                MenuButton {
                    id: replayButton

                    source: Quickshell.iconPath("media-playlist-repeat-symbolic")
                    background: Recorder.replaying ? Colors.primary : Colors.bad

                    onClicked: event => {
                        if (event.button === Qt.LeftButton) {
                            Recorder.replay();
                        } else if (event.button === Qt.RightButton) {
                            Recorder.replaying = !Recorder.replaying;
                        }
                    }
                }

                MenuText {
                    text: "Replay"
                    direction: MenuText.Direction.Left
                    revealText: replayButton.containsMouse
                }
            }

            RowLayout {
                clip: true
                spacing: 0

                MenuButton {
                    id: recordButton

                    source: Quickshell.iconPath("media-record-symbolic")
                    background: Recorder.recording ? Colors.good : Colors.primary
                    forceShrink: pauseButton.containsMouse

                    onClicked: Recorder.recording = !Recorder.recording
                }

                WrapperItem {
                    property real revealProgress: Number(Recorder.recording)

                    Layout.preferredWidth: implicitWidth * revealProgress
                    Layout.leftMargin: 30 * revealProgress

                    Behavior on revealProgress {
                        NumberAnimation {
                            id: revealAnim
                            duration: 200
                            easing.type: Easing.OutCubic
                        }
                    }

                    MenuButton {
                        id: pauseButton

                        clip: true

                        background: Recorder.paused ? Colors.primary : Colors.warning
                        forceShrink: recordButton.containsMouse
                        source: {
                            if (Recorder.paused) {
                                return Quickshell.iconPath("media-playback-pause-symbolic");
                            }

                            return Quickshell.iconPath("media-playback-start-symbolic");
                        }

                        onClicked: Recorder.playPause()
                    }
                }

                MenuText {
                    text: "Record"
                    direction: MenuText.Direction.Left
                    revealText: recordButton.containsMouse | pauseButton.containsMouse

                    Layout.leftMargin: 30
                }
            }

            RowLayout {
                spacing: 30

                MenuButton {
                    id: muteButton

                    source: Quickshell.iconPath("audio-input-microphone-symbolic")
                    background: Recorder.micEnabled ? Colors.primary : Colors.bad

                    onClicked: Recorder.micEnabled = !Recorder.micEnabled
                }

                MenuText {
                    text: "Mute Mic"
                    direction: MenuText.Direction.Left
                    revealText: muteButton.containsMouse
                }
            }
        }
    }

    WindowIpc {
        target: "replay"
    }
}
