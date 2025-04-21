import { App, Astal, Gtk, Gdk } from "astal/gtk4";
import { AstalIO, interval, timeout, Variable } from "astal";

import AstalNotifd from "gi://AstalNotifd";

import Notification from "../components/Notification";

const MAX_NOTIFICATION_TIMEOUT = 3000;

interface NotificationData {
    id: number;
    hide: number;
    hideTimeout: AstalIO.Time | null;
    progress: Variable<number>;
    progressInterval: AstalIO.Time;
}

export default function (gdkmonitor: Gdk.Monitor) {
    const notifd = AstalNotifd.get_default();
    const notifications = Variable<NotificationData[]>([]);

    function hide_notification(id: number) {
        const notifs = notifications.get();
        const idx = notifs.findIndex(notifs => notifs.id === id);

        if (idx === -1) {
            return;
        }

        notifs[idx].hideTimeout?.cancel();
        notifs[idx].progressInterval.cancel();

        notifs.splice(idx, 1);
        notifications.set([...notifs]);
    }

    notifd.connect("notified", (_, id) => {
        const notifs = notifications.get();
        const idx = notifs.findIndex(notifs => notifs.id === id);

        if (idx !== -1) {
            notifs[idx].hideTimeout?.cancel();
            notifs[idx].progressInterval.cancel();
            notifs.splice(idx, 1);
        }

        const notification = notifd.get_notification(id);
        const hideTimeout = notification.get_expire_timeout() > MAX_NOTIFICATION_TIMEOUT || notification.get_expire_timeout() <= 0
            ? MAX_NOTIFICATION_TIMEOUT
            : notification.get_expire_timeout();

        const data: NotificationData = {
            id,
            hide: hideTimeout,
            hideTimeout: notification.get_expire_timeout() > MAX_NOTIFICATION_TIMEOUT || notification.get_expire_timeout() <= 0
                ? timeout(hideTimeout, () => hide_notification(id))
                : null,
            progress: Variable(hideTimeout),
            progressInterval: interval(10, () => data.progress.set(data.progress.get() - 10)),
        };

        notifs.push(data);
        notifications.set([...notifs]);
    });

    notifd.connect("resolved", (_, id) => hide_notification(id));

    return (
        <window
            name="notifications"
            gdkmonitor={gdkmonitor}
            visible={notifications().as(notifications => notifications.length > 0)}
            anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
            application={App}>
            <box cssClasses={["notifications"]}>
                <box
                    cssClasses={["layout-box"]}
                    spacing={20}
                    halign={Gtk.Align.END}
                    orientation={Gtk.Orientation.VERTICAL}>
                    {notifications().as(notifications => notifications.map((notification) => {
                        const notif = notifd.get_notification(notification.id);

                        return (
                            <overlay>
                                <Notification
                                    notification={notif}
                                    onHide={() => hide_notification(notification.id)}
                                    progress={notification.progress().as(progress => progress / notification.hide)} />
                            </overlay>
                        );
                    }))}
                </box>
            </box>
        </window>
    ) as Astal.Window;
}
