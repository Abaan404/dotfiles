import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import QtQuick.Controls.impl 2.15

import Quickshell
import Quickshell.Widgets
import Quickshell.Services.Notifications

import Colors
import Utils

RowLayout {
    id: root

    required property Notification notification
    required property date createdAt
    required property date expireAt
    property real timeout: 0

    spacing: 10

    ProgressBar {
        id: control

        Layout.fillHeight: true
        Layout.maximumWidth: 200
        Layout.preferredWidth: background.implicitWidth + background.anchors.leftMargin + background.anchors.rightMargin

        contentItem: Item {}

        background: Rectangle {
            radius: 10
            color: root.notification.urgency === NotificationUrgency.Critical ? Colors.bad : Colors.secondary

            Rectangle {
                height: parent.height
                width: control.visualPosition * parent.width
                color: Qt.lighter(Colors.primary, 1.2)
                radius: 10
            }

            Text {
                id: background

                anchors.fill: parent
                anchors.margins: 3
                anchors.leftMargin: 10
                anchors.rightMargin: 10
                horizontalAlignment: Text.AlignHCenter
                verticalAlignment: Text.AlignVCenter

                text: root.notification.appName
                color: Colors.text
                elide: Text.ElideRight

                font {
                    weight: Font.ExtraBold
                    pixelSize: 14
                }
            }
        }

        FrameAnimation {
            running: root.expireAt.getTime() >= Date.now()
            onTriggered: {
                const current = Date.now() - root.createdAt.getTime();
                const expire = root.expireAt.getTime() - root.createdAt.getTime();

                if (current > expire) {
                    root.notification.expire();
                }

                control.value = MathHelper.clamp(current / expire, 0, 1);
            }
        }
    }

    Item {
        Layout.fillWidth: true
    }

    WrapperRectangle {
        margin: 3
        leftMargin: 10
        rightMargin: 10
        radius: 10
        color: Colors.secondary

        Text {
            text: Qt.formatDateTime(root.createdAt, "hh:mm")
            color: Colors.text

            font {
                weight: Font.ExtraBold
                pixelSize: 14
            }
        }
    }

    WrapperMouseArea {
        id: close
        hoverEnabled: true

        onClicked: root.notification.dismiss()

        WrapperRectangle {
            margin: 3
            leftMargin: 7
            rightMargin: 7
            radius: 10
            color: ColorHelper.mouse(Colors.bad, close.containsMouse, close.containsPress)

            Behavior on color {
                ColorAnimation {
                    duration: 200
                }
            }

            ColorImage {
                source: Quickshell.iconPath("close-symbolic")
                color: Colors.text

                sourceSize {
                    width: 16
                    height: 16
                }
            }
        }
    }
}
