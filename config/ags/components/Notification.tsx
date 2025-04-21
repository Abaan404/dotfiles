import { Gtk } from "astal/gtk4";
import { bind, Binding, Gio, GLib } from "astal";

import Notifd from "gi://AstalNotifd";

import { Picture, ProgressBar, Separator } from "../utils/widgets";
import { MouseButton } from "../utils/inputs";
import { get_urgency_name } from "../utils/strings";

export default function ({
    notification,
    onHide,
    progress,
}: {
    notification: Notifd.Notification;
    onHide?: () => void;
    progress?: Binding<number>;
}) {
    const widget = (
        <box
            widthRequest={400}
            cssClasses={["notification"]}
            orientation={Gtk.Orientation.VERTICAL}
            spacing={10}>
            <box cssClasses={["header"]}>
                <label
                    cssClasses={bind(notification, "urgency").as(urgency => ["app-name", get_urgency_name(urgency)])}
                    label={bind(notification, "app_name")} />
                <box
                    halign={Gtk.Align.END}
                    hexpand={true}
                    spacing={10}>
                    <label cssClasses={["time"]} label={bind(notification, "time").as(time => GLib.DateTime.new_from_unix_local(time).format("%H:%M")!)} />
                    {onHide && (
                        <button
                            onButtonPressed={(_, e) => {
                                switch (e.get_button()) {
                                    case MouseButton.PRIMARY:
                                        onHide();
                                        break;

                                    default:
                                        break;
                                }
                            }}>
                            <image cssClasses={["hide"]} iconName="eye-open-negative-filled-symbolic" />
                        </button>
                    )}
                    <button
                        onButtonPressed={(_, e) => {
                            switch (e.get_button()) {
                                case MouseButton.PRIMARY:
                                    notification.dismiss();
                                    break;

                                default:
                                    break;
                            }
                        }}>
                        <image cssClasses={["dismiss"]} iconName="close-symbolic" />
                    </button>
                </box>
            </box>
            <box
                cssClasses={["data"]}>
                {bind(notification, "image").as((image) => {
                    if (!image) {
                        return <></>;
                    }

                    return (
                        <box cssClasses={["image"]}>
                            <Picture
                                contentFit={Gtk.ContentFit.COVER}
                                file={Gio.File.new_for_path(image)} />
                        </box>
                    );
                })}
                <box
                    cssClasses={["info"]}
                    hexpand={true}
                    orientation={Gtk.Orientation.VERTICAL}>
                    <label
                        cssClasses={["summary"]}
                        xalign={0}
                        wrap={true}
                        label={bind(notification, "summary")} />
                    <label
                        cssClasses={["body"]}
                        useMarkup={true}
                        justify={Gtk.Justification.LEFT}
                        xalign={0}
                        wrap={true}
                        valign={Gtk.Align.CENTER}
                        label={bind(notification, "body")} />
                </box>
            </box>
            {notification.get_actions().length > 0 && (
                <box
                    cssClasses={["actions"]}
                    homogeneous={true}
                    spacing={10}>
                    {notification.get_actions().map(action => (
                        <button
                            onButtonPressed={(_, e) => {
                                switch (e.get_button()) {
                                    case MouseButton.PRIMARY:
                                        notification.invoke(action.id);
                                        break;

                                    default:
                                        break;
                                }
                            }}>
                            <label label={action.label}></label>
                        </button>
                    ))}
                </box>
            )}
            {progress && <ProgressBar fraction={progress} />}
        </box>
    );

    return widget;
}
