import App from "ags/gtk4/app";
import { createBinding, For } from "ags";
import { Astal, Gtk, Gdk } from "ags/gtk4";

import AstalNotifd from "gi://AstalNotifd";
import NotificationQueue, { NotificationData } from "../services/notifications";

import { Notification } from "../components/Notification";

export default function (gdkmonitor: Gdk.Monitor) {
    const notifd = AstalNotifd.get_default();
    const notifs = NotificationQueue.get_default();

    return (
        <window
            $={self => self.set_default_size(-1, -1)}
            name="notifications"
            gdkmonitor={gdkmonitor}
            visible={true}
            anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
            application={App}>
            <box class="notifications">
                <box
                    class="layout-box"
                    spacing={20}
                    halign={Gtk.Align.END}
                    orientation={Gtk.Orientation.VERTICAL}>
                    <For each={createBinding(notifs, "queue")}>
                        {(notification: NotificationData) => (
                            <overlay>
                                <Notification
                                    notification={notifd.get_notification(notification.id)}
                                    onHide={() => notification.hide()}
                                    progress={createBinding(notification, "progress").as(progress => progress / notification.duration)} />
                            </overlay>
                        )}
                    </For>
                </box>
            </box>
        </window>
    ) as Astal.Window;
}
