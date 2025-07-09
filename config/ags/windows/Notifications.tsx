import App from "ags/gtk4/app";
import { Accessor, createState, For } from "ags";
import { Astal, Gtk, Gdk } from "ags/gtk4";
import { interval, timeout } from "ags/time";

import AstalNotifd from "gi://AstalNotifd";
import AstalIO from "gi://AstalIO";

import { Notification } from "../components/Notification";

const MAX_NOTIFICATION_TIMEOUT = 5000;

interface NotificationData {
    id: number;
    hide: number;
    hideTimeout: AstalIO.Time | null;
    progress: Accessor<number>;
    progressInterval: AstalIO.Time;
}

export default function (gdkmonitor: Gdk.Monitor) {
    const notifd = AstalNotifd.get_default();
    const [notifications, set_notifications] = createState<NotificationData[]>([]);

    function hide_notification(id: number) {
        const notifs = notifications.get();
        const idx = notifs.findIndex(notifs => notifs.id === id);

        if (idx === -1) {
            return;
        }

        notifs[idx].hideTimeout?.cancel();
        notifs[idx].progressInterval.cancel();

        notifs.splice(idx, 1);
        set_notifications([...notifs]);
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
        const [hideTimeout, set_hide_timeout] = createState(notification.get_expire_timeout() > MAX_NOTIFICATION_TIMEOUT || notification.get_expire_timeout() <= 0
            ? MAX_NOTIFICATION_TIMEOUT
            : notification.get_expire_timeout());

        const data: NotificationData = {
            id: id,
            hide: hideTimeout.get(),
            hideTimeout: notification.get_expire_timeout() > MAX_NOTIFICATION_TIMEOUT || notification.get_expire_timeout() <= 0
                ? timeout(hideTimeout.get(), () => hide_notification(id))
                : null,
            progress: hideTimeout,
            progressInterval: interval(10, () => set_hide_timeout(data.progress.get() - 10)),
        };

        notifs.push(data);
        set_notifications([...notifs]);
    });

    notifd.connect("resolved", (_, id) => hide_notification(id));

    return (
        <window
            name="notifications"
            gdkmonitor={gdkmonitor}
            visible={notifications(notifications => notifications.length > 0)}
            anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
            application={App}>
            <box class="notifications">
                <box
                    class="layout-box"
                    spacing={20}
                    halign={Gtk.Align.END}
                    orientation={Gtk.Orientation.VERTICAL}>
                    <For each={notifications}>
                        {notification => (
                            <overlay>
                                <Notification
                                    notification={notifd.get_notification(notification.id)}
                                    onHide={() => hide_notification(notification.id)}
                                    progress={notification.progress(progress => progress / notification.hide)} />
                            </overlay>
                        )}
                    </For>
                </box>
            </box>
        </window>
    ) as Astal.Window;
}
