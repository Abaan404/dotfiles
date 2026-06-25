import QtQuick

import Quickshell.Widgets

import Colors

WrapperRectangle {
    id: root

    default property list<QtObject> wrappedData

    property bool hoverEnabled: true

    readonly property bool containsMouse: mouseArea.containsMouse
    readonly property bool containsPress: mouseArea.containsPress
    property color background: Colors.primary
    property int padding: 14

    color: {
        if (mouseArea.containsMouse && !mouseArea.containsPress) {
            return Qt.lighter(background, 1.2);
        }

        return background;
    }

    radius: 10

    signal clicked(mouse: MouseEvent)
    signal wheel(mouse: WheelEvent)

    Behavior on color {
        ColorAnimation {
            target: root
            property: "color"
            duration: 200
        }
    }

    Component.onCompleted: {
        // find the first item to set as child
        for (const obj of wrappedData) {
            if (obj instanceof Item) {
                mouseArea.child = obj;
                break;
            }
        }
    }

    WrapperMouseArea {
        id: mouseArea

        leftMargin: root.padding
        rightMargin: root.padding

        acceptedButtons: Qt.LeftButton | Qt.RightButton
        hoverEnabled: root.hoverEnabled
        onClicked: event => root.clicked(event)
        onWheel: event => root.wheel(event)
    }
}
