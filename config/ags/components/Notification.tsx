import Gio from "gi://Gio";
import GLib from "gi://GLib";
import Adw from "gi://Adw";
import { Gtk } from "ags/gtk4";
import { createBinding, Accessor, FCProps } from "ags";

import Notifd from "gi://AstalNotifd";

import { get_urgency_name } from "../utils/helpers";

type NotificationProps = FCProps<
    Gtk.Box,
    {
        notification: Notifd.Notification;
        onHide?: () => void;
        progress?: Accessor<number>;
    }
>;

export function Notification({ notification, onHide, progress }: NotificationProps) {
    let image_widget = <></>;
    let summary_widget = <></>;
    let body_widget = <></>;

    const image = createBinding(notification, "image");
    if (image.get()) {
        image_widget = (
            <box class="image">
                <Adw.Clamp
                    maximumSize={64}>
                    <Gtk.Picture
                        contentFit={Gtk.ContentFit.COVER}
                        file={image(img => Gio.File.new_for_path(img))} />
                </Adw.Clamp>
            </box>
        );
    }

    const summary = createBinding(notification, "summary");
    if (summary.get().length > 0) {
        summary_widget = (
            <label
                class="summary"
                xalign={0}
                wrap={true}
                label={summary} />
        );
    }

    const body = createBinding(notification, "body");
    if (body.get().length > 0) {
        body_widget = (
            <label
                class="body"
                useMarkup={true}
                justify={Gtk.Justification.LEFT}
                xalign={0}
                wrap={true}
                valign={Gtk.Align.CENTER}
                label={body} />
        );
    }

    return (
        <box
            widthRequest={400}
            class="notification"
            orientation={Gtk.Orientation.VERTICAL}
            spacing={10}>
            <box class="header">
                <label
                    class={createBinding(notification, "urgency").as(urgency => `app-name ${get_urgency_name(urgency)}`)}
                    label={createBinding(notification, "app_name")} />
                <box
                    halign={Gtk.Align.END}
                    hexpand={true}
                    spacing={10}>
                    <label class="time" label={createBinding(notification, "time").as(time => GLib.DateTime.new_from_unix_local(time).format("%H:%M")!)} />
                    {onHide && (
                        <button
                            onClicked={() => onHide()}>
                            <image class="hide" iconName="eye-open-negative-filled-symbolic" />
                        </button>
                    )}
                    <button
                        onClicked={() => notification.dismiss()}>
                        <image class="dismiss" iconName="close-symbolic" />
                    </button>
                </box>
            </box>
            <box
                class="data">
                {image_widget}
                <box
                    class="info"
                    hexpand={true}
                    orientation={Gtk.Orientation.VERTICAL}>
                    {summary_widget}
                    {body_widget}
                </box>
            </box>
            {notification.get_actions().length > 0 && (
                <box
                    class="actions"
                    homogeneous={true}
                    spacing={10}>
                    {notification.get_actions().map(action => (
                        <button
                            onClicked={() => notification.invoke(action.id)}>
                            <label label={action.label}></label>
                        </button>
                    ))}
                </box>
            )}
            {progress && <Gtk.ProgressBar fraction={progress} />}
        </box>
    );
}
