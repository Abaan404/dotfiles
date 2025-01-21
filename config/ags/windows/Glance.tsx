import { App, Astal, Gtk, Gdk, Widget } from "astal/gtk3";
import { GLib, Variable, bind } from "astal";
import { readFileAsync } from "astal/file";

import AstalNetwork from "gi://AstalNetwork?version=0.1";
import AstalPowerProfiles from "gi://AstalPowerProfiles?version=0.1";
import AstalBluetooth from "gi://AstalBluetooth?version=0.1";
import AstalBattery from "gi://AstalBattery?version=0.1";

import { BoxedWindow } from "../widgets/BoxedWindow";
import { Calendar } from "../widgets/Calendar";
import { to_timestamp } from "../utils/strings";

function Weather() {
    return (
        <eventbox
            className="weather">
            <box
                orientation={Gtk.Orientation.VERTICAL}>
                <box
                    spacing={10}
                    halign={Gtk.Align.START}>
                    <box
                        className="icon">
                    </box>
                    <box
                        homogeneous={true}
                        orientation={Gtk.Orientation.VERTICAL}>
                        <label
                            halign={Gtk.Align.START}
                            valign={Gtk.Align.END}
                            className="description" />
                        <label
                            halign={Gtk.Align.START}
                            valign={Gtk.Align.START}
                            className="temperature" />
                    </box>
                </box>
                <revealer
                    transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}>
                    <box
                        className="footer"
                        homogeneous={true}>
                        <label
                            halign={Gtk.Align.START}
                            className="description" />
                        <label
                            halign={Gtk.Align.END}
                            className="temperature" />
                    </box>
                </revealer>
            </box>
        </eventbox>
    );
}

function Power() {
    const powerprofiles = AstalPowerProfiles.get_default();

    const uptime = Variable(0).poll(
        1000,
        () => readFileAsync("/proc/uptime")
            .then(res => parseInt(res))
            .catch(_ => 0),
    );

    return (
        <box
            className="power">
            <box
                orientation={Gtk.Orientation.VERTICAL}
                homogeneous={true}>
                <label
                    className="mode"
                    valign={Gtk.Align.END}
                    halign={Gtk.Align.END}
                    label={bind(powerprofiles, "active_profile").as((active_profile) => {
                        switch (active_profile) {
                            case "power-saver":
                                return "Power Saving";

                            case "balanced":
                                return "Balanced";

                            case "performance":
                                return "Performance";

                            default:
                                return "Performance";
                        }
                    })} />

                <label
                    className="uptime"
                    valign={Gtk.Align.CENTER}
                    halign={Gtk.Align.END}
                    label={uptime().as(uptime => `uptime: ${to_timestamp(uptime)}`)} />
            </box>
            <icon
                className="icon"
                icon={bind(powerprofiles, "icon_name")} />
        </box>
    );
}

function Network() {
    const wifi = AstalNetwork.get_default().wifi;
    const access_points = Variable.derive(
        [bind(wifi, "active_access_point"), bind(wifi, "access_points")],
        (active_access_point, access_points) => {
            return access_points.map((access_point) => {
                return (
                    <eventbox
                        className="entry"
                        hexpand={true}>
                        <box
                            spacing={5}>
                            <icon className="icon" icon={access_point.get_icon_name()} />
                            <label className="value" label={access_point.get_ssid() || "Unknown"} />
                        </box>
                    </eventbox>
                );
            });
        },
    );

    function internet_to_string(internet: AstalNetwork.Internet) {
        switch (internet) {
            case AstalNetwork.Internet.CONNECTED: return "connected";
            case AstalNetwork.Internet.CONNECTING: return "connecting";
            case AstalNetwork.Internet.DISCONNECTED: return "disconnected";
        }
    }

    return (
        <box
            name="network"
            className="network"
            orientation={Gtk.Orientation.VERTICAL}
            spacing={10}>
            <box
                halign={Gtk.Align.CENTER}
                hexpand={true}
                spacing={10}>
                <icon />
                <label label={bind(wifi, "internet").as(internet => internet_to_string(internet))} />
            </box>

            <scrollable
                vexpand={true}>
                <box
                    orientation={Gtk.Orientation.VERTICAL}>
                    {access_points()}
                </box>
            </scrollable>
        </box>
    );
}

function Bluetooth() {
    const bluetooth = AstalBluetooth.get_default();

    const devices = Variable.derive(
        [bind(bluetooth, "devices")],
        (devices) => {
            return devices.map((device) => {
                return (
                    <eventbox
                        className="entry"
                        hexpand={true}>
                        <box
                            spacing={5}>
                            <icon className="icon" icon="bluetooth-symbolic" />
                            <label className="value" label={device.get_alias()} />
                        </box>
                    </eventbox>
                );
            });
        },
    );

    return (
        <box
            className="bluetooth"
            orientation={Gtk.Orientation.VERTICAL}
            spacing={10}>
            <box
                halign={Gtk.Align.CENTER}
                hexpand={true}
                spacing={10}>
                <icon icon="bluetooth-symbolic" />
                <label label={bind(bluetooth, "devices").as((devices) => {
                    return devices.length > 0
                        ? `${bluetooth.get_devices().filter(device => device.get_connected()).length} device(s) are connected.`
                        : "No Devices Connected";
                })} />
            </box>
            <scrollable
                vexpand={true}>
                <box
                    orientation={Gtk.Orientation.VERTICAL}>
                    {devices()}
                </box>
            </scrollable>
        </box>
    );
}

function TimeAndDate() {
    const time = (format: string) => Variable("").poll(1000, () =>
        GLib.DateTime.new_now_local().format(format)!);

    return (
        <box
            name="calendar"
            className="calendar"
            orientation={Gtk.Orientation.VERTICAL}>
            <label
                className="clock"
                label={time("%H : %M : %S")()} />
            <Calendar />
        </box>
    );
}

function QuickSettings() {
    const page = Variable("calendar");

    const network = AstalNetwork.get_default();
    const bluetooth = AstalBluetooth.get_default();
    const battery = AstalBattery.get_default();

    const day_percent = Variable(parseInt(GLib.DateTime.new_now_local().format("%H")!) / 24)
        .poll(60000, () => parseInt(GLib.DateTime.new_now_local().format("%H")!) / 24);

    return (
        <box
            className="quick-settings"
            spacing={20}>
            <stack
                visibleChildName={page()}
                transitionType={Gtk.StackTransitionType.SLIDE_UP_DOWN}>
                <Network />
                <Bluetooth />
                <TimeAndDate />
            </stack>
            <box
                className="controls"
                spacing={20}
                valign={Gtk.Align.FILL}
                orientation={Gtk.Orientation.VERTICAL}
                homogeneous={true}>
                <button
                    onClick={(_, e) => e.button === Astal.MouseButton.PRIMARY ? page.set("network") : null}>
                    {bind(network, "primary").as((primary) => {
                        switch (primary) {
                            case AstalNetwork.Primary.WIRED:
                                return (
                                    <circularprogress
                                        value={1.0}
                                        rounded={true}>
                                        <icon icon={bind(network.wired, "icon_name").as(icon_name => icon_name)} />
                                    </circularprogress>
                                );

                            case AstalNetwork.Primary.WIFI:
                                return (
                                    <circularprogress
                                        value={bind(network.wifi, "strength").as(strength => strength)}
                                        rounded={bind(network.wifi, "strength").as(strength => strength !== 0.0)}>
                                        <icon icon={bind(network.wifi, "icon_name").as(icon_name => icon_name)} />
                                    </circularprogress>
                                );

                            case AstalNetwork.Primary.UNKNOWN:
                                return (
                                    <circularprogress
                                        value={0.0}
                                        rounded={false}>
                                        <icon icon="network-wireless-signal-none-symbolic" />
                                    </circularprogress>
                                );
                        }
                    })}
                </button>

                <button
                    onClick={(_, e) => e.button === Astal.MouseButton.PRIMARY ? page.set("bluetooth") : null}>
                    <circularprogress
                        value={bind(bluetooth, "devices").as((devices) => {
                            const connected_devices = devices.filter(device => device.connected);
                            if (connected_devices.length === 0) {
                                return 0.0;
                            }

                            // FIXME: this should return the first bluetooth device's battery
                            return 1.0;
                        })}
                        rounded={bind(bluetooth, "is_connected").as(is_connected => is_connected)}>
                        <icon icon="bluetooth-symbolic" />
                    </circularprogress>
                </button>

                <button>
                    <circularprogress
                        value={bind(battery, "percentage").as(percentage => percentage)}
                        rounded={bind(battery, "percentage").as(percentage => percentage !== 0.0)}>
                        <icon icon={bind(battery, "icon_name")} />
                    </circularprogress>
                </button>

                <button
                    onClick={(_, e) => e.button === Astal.MouseButton.PRIMARY ? page.set("calendar") : null}>
                    <circularprogress
                        value={day_percent()}
                        rounded={true}>
                        <icon icon="timer-symbolic" />
                    </circularprogress>
                </button>
            </box>
        </box>
    );
}

function QuickInfo() {
    return (
        <box
            spacing={20}
            orientation={Gtk.Orientation.VERTICAL}>
            <Weather />
            <Power />
        </box>
    );
}

function RowOne() {
    return (
        <box
            spacing={20}>
            <QuickInfo />
            <QuickSettings />
        </box>
    );
}

export default function (gdkmonitor: Gdk.Monitor) {
    return (
        <BoxedWindow
            name="glance"
            gdkmonitor={gdkmonitor}
            anchor={Astal.WindowAnchor.RIGHT
            | Astal.WindowAnchor.TOP}
            application={App}
            layout_box_props={{
                spacing: 10,
                orientation: Gtk.Orientation.VERTICAL,
            }}>
            <RowOne />
        </BoxedWindow>
    ) as Widget.Window;
}
