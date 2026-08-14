import QtQuick
import QtQuick.Layouts
import QtQuick.Controls

import Quickshell
import Quickshell.Widgets

import Services
import qs.windows
import qs.windows.glance.pages

PanelWindow { // qmllint disable uncreatable-type
    implicitWidth: 1000
    color: "transparent"

    visible: true
    exclusionMode: ExclusionMode.Ignore
    mask: widget.region
    focusable: mouseArea.containsMouse

    anchors {
        top: true
        bottom: true
        right: true
    }

    margins { // qmllint disable unqualified unresolved-type
        top: 50 // qmllint disable missing-property
        right: 10 // qmllint disable missing-property
    }

    Component.onCompleted: {
        WindowState.register("glance", this);
    }

    WrapperMouseArea {
        id: mouseArea
        hoverEnabled: true

        y: parent.visible ? 0 : -50

        Behavior on y {
            NumberAnimation {
                duration: 400
                easing.type: Easing.OutBack
            }
        }

        anchors {
            right: parent.right
            left: parent.left
        }

        RowLayout {
            id: widget

            property Region region: Region {
                regions: [weather.region, controls.region, view.region, notifications.region]
            }

            spacing: 20

            // spacer
            Item {
                Layout.fillWidth: true
            }

            ColumnLayout {
                Weather {
                    id: weather
                }

                // spacer
                Item {
                    Layout.fillHeight: true
                }
            }

            ColumnLayout {
                Layout.maximumWidth: 500

                spacing: 20

                RowLayout {
                    Layout.alignment: Qt.AlignRight

                    spacing: 20

                    SwipeView {
                        id: view

                        Layout.fillWidth: true

                        property Region region: Region {
                            item: view
                            radius: 20
                        }

                        Layout.preferredHeight: 0
                        Layout.fillHeight: true

                        orientation: Qt.Vertical
                        currentIndex: 2

                        clip: true

                        Network {}
                        Bluetooth {}
                        Calendar {}
                    }

                    Controls {
                        id: controls

                        onSelectedIdxChanged: {
                            if (selectedIdx < 0) {
                                return;
                            }

                            view.currentIndex = selectedIdx;
                        }
                        Component.onCompleted: selectedIdx = view.currentIndex
                    }
                }

                Notifications {
                    id: notifications

                    Layout.preferredHeight: view.height * 1.5
                    Layout.fillWidth: true
                }
            }
        }
    }

    WindowIpc {
        target: "media"
    }
}
