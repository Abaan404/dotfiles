import QtQuick
import QtQuick.Layouts
import QtQuick.Controls.impl 2.15

import Quickshell
import Quickshell.Widgets
import Quickshell.Services.Notifications

import Colors
import Utils

RowLayout {
    id: root

    required property Notification notification

    visible: notification.hasInlineReply
    spacing: 10

    WrapperMouseArea {
        id: text

        hoverEnabled: true

        Layout.fillWidth: true

        WrapperRectangle {
            margin: 5
            leftMargin: 12
            rightMargin: 12
            radius: 10
            color: Colors.primary

            Behavior on color {
                ColorAnimation {
                    duration: 200
                }
            }

            TextInput {
                id: input

                clip: true
                text: root.notification.inlineReplyPlaceholder
                color: Colors.text

                font {
                    pixelSize: 14
                    weight: Font.ExtraBold
                }

                onAccepted: {
                    root.notification.sendInlineReply(text);
                }
            }
        }
    }

    WrapperMouseArea {
        id: button

        hoverEnabled: true

        Layout.preferredWidth: parent.implicitHeight
        Layout.preferredHeight: text.height

        onClicked: {
            root.notification.sendInlineReply(input.text);
        }

        WrapperRectangle {
            color: ColorHelper.mouseWithColor(Colors.good, Qt.lighter(Colors.good, 0.9), button.containsMouse, button.containsPress)
            radius: 10

            Behavior on color {
                ColorAnimation {
                    duration: 200
                }
            }

            ColorImage {
                source: Quickshell.iconPath("reply-symbolic")
                anchors.fill: parent
                anchors.margins: 8
                color: Colors.text
            }
        }
    }
}
