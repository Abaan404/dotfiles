pragma Singleton

import QtQuick

import Quickshell
import Quickshell.Services.Notifications

Singleton {
    id: root

    property ScriptModel objects: ScriptModel {}

    NotificationServer {
        id: server

        bodySupported: true
        inlineReplySupported: true
        actionsSupported: true
        imageSupported: true

        onNotification: notification => {
            notification.tracked = true;

            let expireAt = Date.now() + 5 * 1000;

            if (notification.expireTimeout > 0) {
                expireAt = Date.now() + notification.expireTimeout;
            }

            root.objects.values.push({
                notification: notification,
                createdAt: new Date(),
                expireAt: new Date(expireAt)
            });

            notification.closed.connect(() => {
                root.objects.values = root.objects.values.filter(o => o.notification !== notification);
            });
        }
    }
}
