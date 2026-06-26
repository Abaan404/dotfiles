import QtQuick
import QtQuick.Controls

import Quickshell

import Colors
import Services

import qs.windows.bar

BarItem {
    id: root
    padding: 10

    onClicked: {
        WindowState.toggle("power");
    }

    BarRevealerText {
        spacingText: 4

        text: "Power"

        reveal: root.containsMouse || icon.hovered

        Button {
            id: icon

            background: Rectangle {
                color: "transparent"
            }

            icon {
                width: 16
                height: 16

                source: Quickshell.iconPath("system-log-out-symbolic")

                color: Colors.text
            }
        }
    }
}
