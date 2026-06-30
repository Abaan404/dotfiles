import QtQuick
import QtQuick.Layouts

import Quickshell
import Quickshell.Widgets

import Services
import Colors

import qs.windows

PanelWindow { // qmllint disable uncreatable-type
    visible: false
    color: "transparent"
    implicitHeight: 200

    exclusionMode: ExclusionMode.Ignore

    mask: Region {
        item: maskItem
    }

    anchors {
        top: true
        left: true
        right: true
    }

    margins { // qmllint disable unqualified unresolved-type
        top: 50 // qmllint disable missing-property
    }

    Component.onCompleted: {
        WindowState.register("mpris", this);
    }

    WrapperItem {
        topMargin: parent.visible ? 0 : -50

        anchors {
            horizontalCenter: parent.horizontalCenter
        }

        Behavior on topMargin {
            NumberAnimation {
                duration: 400
                easing.type: Easing.OutBack
            }
        }

        WrapperRectangle {
            id: maskItem

            color: Colors.primary
            radius: 10

            RowLayout {
                Left {
                    Layout.fillHeight: true
                }

                Right {
                    Layout.alignment: Qt.AlignTop
                    Layout.topMargin: 10
                    Layout.bottomMargin: 10
                    Layout.leftMargin: 20
                    Layout.rightMargin: 30
                }
            }
        }
    }

    WindowIpc {
        target: "mpris"
    }
}
