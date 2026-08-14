pragma Singleton

import QtQuick

import Quickshell
import Quickshell.Services.Notifications

Singleton {
    id: root

    readonly property alias notifying: internal.notifying
    readonly property alias objects: internal.objects

    property bool dnd: false

    function dismissAll() {
        [...internal.objects.values].forEach(obj => obj.notification.dismiss());
    }

    QtObject {
        id: internal

        property ScriptModel notifying: ScriptModel {}
        property ScriptModel objects: ScriptModel {}
    }

    NotificationServer {
        id: server

        bodySupported: true
        inlineReplySupported: true
        actionsSupported: true
        imageSupported: true

        onNotification: notification => {
            notification.tracked = true;

            // Note: might wanna store these in a queue to pop later
            // but I dont care too much about notifs during dnd (am lazy)
            if (root.dnd) {
                notification.dismiss();
                return;
            }

            let timeout = 5000;

            if (notification.expireTimeout > 0) {
                timeout = notification.expireTimeout;
            }

            Timeout.setTimeout(() => {
                // client needs to be hinted if set
                if (notification?.expireTimeout > 0) {
                    notification?.expire();
                }

                internal.notifying.values = internal.notifying.values.filter(o => o.notification !== notification);
            }, timeout);

            const data = {
                notification: notification,
                createdAt: new Date(),
                expireAt: new Date(Date.now() + timeout)
            };

            internal.objects.values.push(data);
            internal.notifying.values.push(data);

            notification.closed.connect(reason => {
                internal.notifying.values = internal.notifying.values.filter(o => o.notification !== notification);
                internal.objects.values = internal.objects.values.filter(o => o.notification !== notification);
            });
        }
    }
}
