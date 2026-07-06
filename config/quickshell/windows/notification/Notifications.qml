import QtQuick

import Quickshell
import Quickshell.Widgets

import Services

PanelWindow { // qmllint disable uncreatable-type
    visible: NotificationState.objects.values.length > 0
    implicitWidth: 500
    color: "transparent"

    exclusionMode: ExclusionMode.Ignore
    focusable: mouseArea.containsMouse
    mask: widget.region

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

        y: parent.visible ? 0 : -50
        implicitHeight: parent.height
        hoverEnabled: true

        onYChanged: widget.region.changed()

        Behavior on y {
            NumberAnimation {
                duration: 400
                easing.type: Easing.OutBack
            }
        }

        anchors {
            right: parent.right
            left: parent.left
        }

        ListView {
            id: widget

            property Region region: Region {
                regions: widget.contentItem.children.map(child => child.region)
                radius: 10
            }

            model: NotificationState.objects.values
            spacing: 20
            anchors.fill: parent

            delegate: WrapperItem {
                required property var modelData
                readonly property Region region: Region {
                    item: popup
                    radius: 10
                }

                width: ListView.view.width
                clip: true

                Popup {
                    id: popup

                    notification: parent.modelData.notification
                    createdAt: parent.modelData.createdAt
                    expireAt: parent.modelData.expireAt
                }
            }

            // FIXME add doesnt work but populate works due to model being
            // a script model, replacing it with a list model causes random
            // dangling null references (possible memory leak?)
            populate: Transition {
                NumberAnimation {
                    property: "topMargin"
                    from: -50
                    to: 0
                    duration: 400
                    easing.type: Easing.OutBack
                }
            }
        }
    }
}
