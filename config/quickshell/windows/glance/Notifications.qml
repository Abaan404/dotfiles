import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import QtQuick.Controls.impl 2.15

import Quickshell
import Quickshell.Widgets

import qs.windows.glance.pages
import qs.windows.notification

import Colors
import Services

WrapperRectangle {
    id: root

    property Region region: Region {
        item: root
        radius: 20
    }

    color: Colors.colors_color1
    radius: 20

    margin: 20

    ColumnLayout {
        spacing: 10

        RowLayout {
            spacing: 10

            Text {
                Layout.fillWidth: true

                horizontalAlignment: Qt.AlignLeft
                text: "Notifications"
                color: Colors.text

                font {
                    pixelSize: 24
                    weight: Font.ExtraBold
                }
            }

            PageButton {
                background: NotificationState.dnd ? Colors.bad : Colors.primary
                onClicked: NotificationState.dnd = !NotificationState.dnd

                ColorImage {
                    sourceSize {
                        width: 24
                        height: 24
                    }

                    source: Quickshell.iconPath("notification-disabled-symbolic")
                    color: Colors.text
                }
            }

            PageButton {
                background: Colors.bad
                onClicked: NotificationState.dismissAll()

                ColorImage {
                    sourceSize {
                        width: 24
                        height: 24
                    }

                    source: Quickshell.iconPath("close-symbolic")
                    color: Colors.text
                }
            }
        }

        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: 5

            radius: 100
            color: Colors.accent
        }

        Item {
            visible: NotificationState.objects.values.length === 0

            Layout.fillWidth: true
            Layout.fillHeight: true

            Layout.alignment: Qt.AlignCenter

            ColumnLayout {
                anchors.centerIn: parent
                spacing: 20

                ColorImage {
                    Layout.alignment: Qt.AlignHCenter

                    sourceSize {
                        width: 80
                        height: 80
                    }

                    source: Quickshell.iconPath("notifications-symbolic")
                    color: Colors.text
                }

                Text {
                    Layout.alignment: Qt.AlignHCenter

                    visible: NotificationState.objects.values.length === 0

                    text: "All Caught Up!"
                    color: Colors.text

                    font {
                        pixelSize: 24
                        weight: Font.ExtraBold
                    }
                }
            }
        }

        ScrollView {
            Layout.fillWidth: true
            Layout.fillHeight: true

            visible: NotificationState.objects.values.length !== 0
            clip: true

            ListView {
                spacing: 20

                model: NotificationState.objects

                delegate: WrapperItem {
                    id: item

                    required property var modelData

                    implicitWidth: ListView.view.width

                    Popup {
                        notification: item.modelData.notification
                        createdAt: item.modelData.createdAt
                        expireAt: item.modelData.expireAt

                        color: Qt.darker(Colors.colors_color1, 1.2)
                    }
                }
            }
        }
    }
}
