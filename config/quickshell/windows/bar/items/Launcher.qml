import QtQuick
import QtQuick.Effects

import Quickshell.Io

import Colors

import qs.windows.bar

BarItem {
    id: root

    onClicked: launcherProc.running = true

    BarRevealerText {
        text: "Launcher"
        reveal: root.containsMouse
        spacingText: 10

        Rectangle {
            implicitWidth: 16
            color: "transparent"

            Image {
                id: icon
                anchors.centerIn: parent

                fillMode: Image.PreserveAspectFit
                source: "file:///home/abaan404/.dotfiles/assets/launcher-symbolic.svg"
                sourceSize.height: 16
                sourceSize.width: 16
            }

            MultiEffect {
                source: icon
                anchors.fill: icon
                colorization: 1.0
                colorizationColor: Colors.text
            }
        }
    }

    Process {
        id: launcherProc
        command: ["bash", "-c", "pkill rofi || rofi -show drun"]
    }
}
