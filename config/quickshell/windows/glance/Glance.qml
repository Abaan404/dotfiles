import QtQuick
import QtQuick.Layouts
import QtQuick.Controls

import Quickshell
import Quickshell.Widgets

import Services
import qs.windows
import qs.windows.glance.pages

PanelWindow { // qmllint disable uncreatable-type
    implicitWidth: 500
    color: "transparent"

    visible: true
    exclusionMode: ExclusionMode.Ignore
    mask: widget.region

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

    WrapperItem {
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
                regions: [controls.region, view.region]
            }

            RowLayout {
                spacing: 20

                SwipeView {
                    id: view

                    property Region region: Region {
                        item: view
                        radius: 20
                    }

                    Layout.fillWidth: true
                    Layout.fillHeight: true

                    orientation: Qt.Vertical
                    currentIndex: 3

                    clip: true

                    Calendar {}
                    Calendar {}
                    Calendar {}
                    Calendar {}
                }

                Controls {
                    id: controls

                    onSelectedNameChanged: () => {
                        if (selectedName === "internet") {
                            view.currentIndex = 0;
                        } else if (selectedName === "bluetooth") {
                            view.currentIndex = 1;
                        } else if (selectedName === "battery") {
                            view.currentIndex = 2;
                        } else if (selectedName === "time") {
                            view.currentIndex = 3;
                        }
                    }
                }
            }
        }
    }

    WindowIpc {
        target: "media"
    }
}
