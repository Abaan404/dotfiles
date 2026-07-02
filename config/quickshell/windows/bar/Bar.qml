import QtQuick
import QtQuick.Layouts

import Quickshell

import Services

import qs.windows
import qs.windows.bar.items

PanelWindow { // qmllint disable uncreatable-type
    implicitHeight: 30
    color: "transparent"

    mask: Region {
        regions: [...left.children.map(item => item.region), ...middle.children.map(item => item.region), ...right.children.map(item => item.region)]
    }

    anchors {
        top: true
        left: true
        right: true
    }

    margins { // qmllint disable unqualified unresolved-type
        left: 10 // qmllint disable missing-property
        right: 10 // qmllint disable missing-property
        top: 10 // qmllint disable missing-property
    }

    Component.onCompleted: {
        WindowState.register("bar", this);
    }

    RowLayout {
        id: left

        spacing: 10

        anchors {
            left: parent.left
            top: parent.top
            bottom: parent.bottom
        }

        Launcher {
            Layout.fillHeight: true
        }

        Workspaces {
            Layout.fillHeight: true
        }

        Usage {
            id: usage
            Layout.fillHeight: true
        }

        SystemTray {
            reveal: usage.showSystray

            Layout.fillHeight: true
        }
    }

    RowLayout {
        id: middle

        spacing: 10

        anchors {
            horizontalCenter: parent.horizontalCenter
            top: parent.top
            bottom: parent.bottom
        }

        Mpris {
            Layout.fillHeight: true
        }
    }

    RowLayout {
        id: right

        spacing: 10

        anchors {
            right: parent.right
            top: parent.top
            bottom: parent.bottom
        }

        Media {
            Layout.fillHeight: true
        }

        System {
            Layout.fillHeight: true
        }

        Power {
            Layout.fillHeight: true
        }
    }

    WindowIpc {
        target: "bar"
    }
}
