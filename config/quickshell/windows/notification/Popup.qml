import QtQuick
import QtQuick.Layouts

import Quickshell.Widgets
import Quickshell.Services.Notifications

import Colors

WrapperRectangle {
    id: root

    required property Notification notification
    required property date createdAt
    required property date expireAt

    margin: 15
    radius: 10
    color: Colors.colors_color1

    ColumnLayout {
        spacing: 10

        Header {
            notification: root.notification
            createdAt: root.createdAt
            expireAt: root.expireAt
        }

        Body {
            notification: root.notification
        }

        Actions {
            notification: root.notification
        }

        Reply {
            notification: root.notification
        }
    }
}
