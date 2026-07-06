import QtQuick
import QtQuick.Layouts

import Quickshell.Widgets
import Quickshell.Services.Notifications

import Colors
import Utils

RowLayout {
    id: root

    required property Notification notification

    visible: notification.actions.length > 0 // qmllint disable unresolved-type
    uniformCellSizes: true
    spacing: 10

    Repeater {
        model: root.notification.actions // qmllint disable unresolved-type

        delegate: WrapperMouseArea {
            id: button

            required property NotificationAction modelData

            hoverEnabled: true
            onClicked: modelData.invoke()

            Layout.fillWidth: true

            WrapperRectangle {
                color: ColorHelper.mouse(Colors.primary, button.containsMouse, button.containsPress)
                margin: 3
                leftMargin: 10
                rightMargin: 10
                radius: 10

                Behavior on color {
                    ColorAnimation {
                        duration: 200
                    }
                }

                RowLayout {
                    Text {
                        Layout.fillWidth: true
                        horizontalAlignment: Text.AlignHCenter

                        text: button.modelData.text
                        color: Colors.text

                        elide: Text.ElideRight

                        font {
                            pixelSize: 14
                            weight: Font.ExtraBold
                        }
                    }
                }
            }
        }
    }
}
