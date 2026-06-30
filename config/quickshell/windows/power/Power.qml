import QtQuick
import QtQuick.Layouts

import Quickshell
import Quickshell.Io
import Quickshell.Widgets

import Services
import qs.windows

import Colors

PanelWindow { // qmllint disable uncreatable-type
    visible: false
    color: "transparent"
    implicitWidth: 400
    implicitHeight: 690

    exclusionMode: ExclusionMode.Ignore

    mask: Region {
        regions: [shutdownButton.region, rebootButton.region, suspendButton.region, hibernateButton.region]
    }

    anchors {
        right: true
    }

    Component.onCompleted: {
        WindowState.register("power", this);
    }

    WrapperItem {
        rightMargin: parent.visible ? 40 : -40

        Behavior on rightMargin {
            NumberAnimation {
                duration: 400
                easing.type: Easing.OutBack
            }
        }

        anchors {
            verticalCenter: parent.verticalCenter
            right: parent.right
        }

        ColumnLayout {
            spacing: 30

            PowerButton {
                id: shutdownButton
                source: Quickshell.iconPath("system-shutdown-symbolic")
                sourceColor: Colors.bad
                text: "Shutdown"
                onClicked: shutdown.running = true
            }

            PowerButton {
                id: rebootButton
                source: Quickshell.iconPath("system-reboot-symbolic")
                text: "Reboot"
                onClicked: reboot.running = true
            }

            PowerButton {
                id: suspendButton
                source: Quickshell.iconPath("system-suspend-symbolic")
                text: "Suspend"
                onClicked: suspend.running = true
            }

            PowerButton {
                id: hibernateButton
                source: Quickshell.iconPath("system-hibernate-symbolic")
                text: "Hibernate"
                onClicked: hibernate.running = true
            }
        }
    }

    WindowIpc {
        target: "power"
    }

    Process {
        id: shutdown
        command: ["systemctl", "poweroff"]
    }

    Process {
        id: reboot
        command: ["systemctl", "reboot"]
    }

    Process {
        id: suspend
        command: ["systemctl", "suspend"]
    }

    Process {
        id: hibernate
        command: ["systemctl", "hibernate"]
    }
}
