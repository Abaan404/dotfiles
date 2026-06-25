import QtQuick
import QtQuick.Controls

import Quickshell
import Quickshell.Io

import Colors

import ".."

BarItem {
    id: root
    padding: 10

    onClicked: {
        agsProc.running = true;
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

    Process {
        id: agsProc
        command: ["ags", "request", "window powermenu"]
    }
}
