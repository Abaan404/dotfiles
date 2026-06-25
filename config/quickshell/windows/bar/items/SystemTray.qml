import QtQuick
import QtQuick.Layouts

import Quickshell.Services.SystemTray

import ".."

BarItem {
    padding: 10

    property bool reveal: false

    implicitWidth: reveal ? child.implicitWidth : 0
    clip: true

    Behavior on implicitWidth {
        NumberAnimation {
            duration: 400
            easing.type: Easing.OutCubic
        }
    }

    RowLayout {
        Repeater {
            model: SystemTray.items

            delegate: Image {
                required property SystemTrayItem modelData
                source: modelData.icon

                sourceSize {
                    width: 20
                    height: 20
                }
            }
        }
    }
}
