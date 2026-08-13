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

        ColumnLayout {
            id: widget

            property Region region: Region {
                regions: [weather.region, controls.region, view.region]
            }

            RowLayout {
                Layout.alignment: Qt.AlignRight

                spacing: 20

                ColumnLayout {
                    Weather {
                        id: weather
                    }

                    // spacer, Qt.AlignTop wasnt working for some reason
                    Item {
                        Layout.fillHeight: true
                    }
                }

                SwipeView {
                    id: view

                    property Region region: Region {
                        item: view
                        radius: 20
                    }

                    Layout.preferredHeight: 0
                    Layout.preferredWidth: 350
                    Layout.fillHeight: true

                    orientation: Qt.Vertical
                    currentIndex: 3

                    clip: true

                    Network {}
                    Bluetooth {}
                    Calendar {}
                    Calendar {}
                }

                Controls {
                    id: controls

                    onSelectedIdxChanged: view.currentIndex = selectedIdx
                    Component.onCompleted: selectedIdx = view.currentIndex
                }
            }
        }
    }

    WindowIpc {
        target: "media"
    }
}
