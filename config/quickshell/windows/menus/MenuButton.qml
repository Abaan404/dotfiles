import QtQuick
import QtQuick.Controls.impl 2.15

import Quickshell
import Quickshell.Widgets

import Colors
import Utils

WrapperMouseArea {
    id: root

    property string source
    property color sourceColor: Colors.accent
    property color background: Colors.primary
    property bool forceShrink: false

    readonly property Region region: Region {
        item: root
        radius: 10
    }

    implicitWidth: 130
    implicitHeight: containsMouse | forceShrink ? implicitWidth : implicitWidth + 20

    Behavior on implicitHeight {
        NumberAnimation {
            duration: 400
            easing.type: Easing.OutCubic
        }
    }

    hoverEnabled: true
    acceptedButtons: Qt.RightButton | Qt.LeftButton

    Rectangle {
        radius: 10
        color: ColorHelper.mouse(root.background, root.containsMouse, root.containsPress)

        Behavior on color {
            ColorAnimation {
                duration: 100
            }
        }

        // https://stackoverflow.com/questions/69964071/qt-qml-colorimage-is-not-a-type
        ColorImage {
            source: root.source

            anchors.centerIn: parent

            width: 50
            height: 50

            color: root.sourceColor
        }
    }
}
