pragma ComponentBehavior: Bound
import QtQuick

import Quickshell
import Quickshell.Widgets

import Services

PanelWindow { // qmllint disable uncreatable-type
    mask: Region {
        regions: widgets.contentItem.children.map(child => child.region)
    }

    visible: NotificationState.objects.values.length > 0
    implicitWidth: 500
    color: "transparent"

    exclusionMode: ExclusionMode.Ignore
    focusable: mouseArea.containsMouse

    anchors {
        top: true
        right: true
        bottom: true
    }

    margins { // qmllint disable unqualified unresolved-type
        top: 50 // qmllint disable missing-property
        right: 10 // qmllint disable missing-property
    }

    WrapperMouseArea {
        id: mouseArea

        anchors.topMargin: parent.visible ? 0 : -50
        anchors.fill: parent

        hoverEnabled: true

        Behavior on anchors.topMargin {
            NumberAnimation {
                duration: 400
                easing.type: Easing.OutBack
            }
        }

        ListView {
            id: widgets

            model: NotificationState.objects.values
            spacing: 20
            anchors.fill: parent

            delegate: Popup {
                required property var modelData

                clip: true
                width: ListView.view.width

                notification: modelData.notification
                createdAt: modelData.createdAt
                expireAt: modelData.expireAt
            }

            // FIXME add doesnt work but populate works due to model being
            // a script model, replacing it with a list model causes random
            // dangling null references (possible memory leak?)
            populate: Transition {
                NumberAnimation {
                    property: "topMargin"
                    from: -50
                    to: 10
                    duration: 400
                    easing.type: Easing.OutBack
                }
            }
        }
    }
}
