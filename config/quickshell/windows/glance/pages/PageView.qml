import QtQuick
import QtQuick.Controls

ListView {
    id: root

    spacing: 10

    add: Transition {
        NumberAnimation {
            properties: "opacity"
            from: 0
            to: 1
            duration: 200
            easing.type: Easing.OutExpo
        }
        NumberAnimation {
            properties: "x"
            from: -root.width
            duration: 200
            easing.type: Easing.OutExpo
        }
    }

    remove: Transition {
        NumberAnimation {
            properties: "opacity"
            to: 0
            duration: 150
            easing.type: Easing.InExpo
        }
        NumberAnimation {
            properties: "x"
            to: root.width
            duration: 150
            easing.type: Easing.InExpo
        }
    }

    move: Transition {
        NumberAnimation {
            properties: "x,y"
            duration: 200
            easing.type: Easing.OutExpo
        }
    }

    displaced: Transition {
        NumberAnimation {
            properties: "x,y"
            duration: 200
            easing.type: Easing.OutExpo
        }
    }

    ScrollIndicator.vertical: ScrollIndicator {}
}
