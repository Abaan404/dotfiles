import QtQuick

import Quickshell.Widgets

import Colors
import Utils

WrapperMouseArea {
    id: root

    default property alias child2: rect.child
    property color background: Colors.primary
    property int rectMargin: 8
    property int rectSideMargin: rectMargin

    hoverEnabled: true

    WrapperRectangle {
        id: rect

        radius: 10
        margin: root.rectMargin
        leftMargin: root.rectSideMargin
        rightMargin: root.rectSideMargin

        color: ColorHelper.mouse(root.background, root.containsMouse, root.containsPress)

        Behavior on color {
            ColorAnimation {
                duration: 400
                easing.type: Easing.OutExpo
            }
        }
    }
}
