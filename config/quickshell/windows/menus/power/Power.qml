import QtQuick
import QtQuick.Layouts

import Quickshell
import Quickshell.Widgets

import Services
import qs.windows
import qs.windows.menus

import Colors

PanelWindow { // qmllint disable uncreatable-type
    visible: false
    color: "transparent"
    implicitWidth: 310
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

            RowLayout {
                spacing: 30

                Layout.alignment: Qt.AlignRight

                MenuText {
                    text: "Shutdown"
                    direction: MenuText.Direction.Right
                    revealText: shutdownButton.containsMouse
                }

                MenuButton {
                    id: shutdownButton
                    source: Quickshell.iconPath("system-shutdown-symbolic")
                    sourceColor: Colors.bad
                    onClicked: Quickshell.execDetached(["systemctl", "poweroff"])
                }
            }

            RowLayout {
                spacing: 30

                Layout.alignment: Qt.AlignRight

                MenuText {
                    text: "Reboot"
                    direction: MenuText.Direction.Right
                    revealText: rebootButton.containsMouse
                }

                MenuButton {
                    id: rebootButton
                    source: Quickshell.iconPath("system-reboot-symbolic")
                    onClicked: Quickshell.execDetached(["systemctl", "reboot"])
                }
            }

            RowLayout {
                spacing: 30

                Layout.alignment: Qt.AlignRight

                MenuText {
                    text: "Suspend"
                    direction: MenuText.Direction.Right
                    revealText: suspendButton.containsMouse
                }

                MenuButton {
                    id: suspendButton
                    source: Quickshell.iconPath("system-suspend-symbolic")
                    onClicked: Quickshell.execDetached(["systemctl", "suspend"])
                }
            }

            RowLayout {
                spacing: 30

                Layout.alignment: Qt.AlignRight

                MenuText {
                    text: "Hibernate"
                    direction: MenuText.Direction.Right
                    revealText: hibernateButton.containsMouse
                }

                MenuButton {
                    id: hibernateButton
                    source: Quickshell.iconPath("system-hibernate-symbolic")
                    onClicked: Quickshell.execDetached(["systemctl", "hibernate"])
                }
            }
        }
    }

    WindowIpc {
        target: "power"
    }
}
