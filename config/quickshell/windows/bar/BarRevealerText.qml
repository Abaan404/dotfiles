import QtQuick
import QtQuick.Layouts

import Quickshell.Widgets

RowLayout {
    id: root

    default property alias content: item.data

    required property string text
    property bool reveal: true
    property int spacingText: 0 // workaround shadowing vars, could use an item wrapper but nah

    spacing: 0

    WrapperItem {
        id: item
    }

    BarText {
        text: root.text
        clip: true
        leftPadding: root.spacingText

        Layout.preferredWidth: root.reveal ? implicitWidth : 0

        Behavior on Layout.preferredWidth {
            SequentialAnimation {
                NumberAnimation {
                    duration: 400
                    easing.type: Easing.OutCubic
                }
            }
        }
    }
}
