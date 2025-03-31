import { App, Astal, Gtk, Gdk, Widget } from "astal/gtk3";
import { GLib, Variable, bind, execAsync } from "astal";
import { readFileAsync } from "astal/file";

import AstalNetwork from "gi://AstalNetwork";
import AstalPowerProfiles from "gi://AstalPowerProfiles";
import AstalBluetooth from "gi://AstalBluetooth";
import AstalBattery from "gi://AstalBattery";
import Weather from "../services/weather";

import { BoxedWindow } from "../widgets/BoxedWindow";
import { Calendar } from "../widgets/Calendar";
import { to_timestamp, truncate } from "../utils/strings";
import { Separator } from "../widgets/Separator";

function WeatherInfo() {
    const weather = Weather.get_default();

    const reveal = Variable(false);

    return (
        <eventbox
            className="weather"
            hexpand={true}
            onHover={() => reveal.set(true)}
            onHoverLost={() => reveal.set(false)}
            onClick={(_, e) => {
                switch (e.button) {
                    case Astal.MouseButton.PRIMARY:
                        execAsync(["xdg-open", `https://openweathermap.org/city/${weather.city_id}`]);
                        break;

                    default:
                        break;
                }
            }}>
            <box
                orientation={Gtk.Orientation.VERTICAL}>
                <box
                    spacing={10}
                    halign={Gtk.Align.START}>
                    <box
                        className="icon"
                        css={bind(weather, "image_path").as(image_path => `background: url('file://${image_path}'); background-size: 72px;`)}>
                    </box>
                    <box
                        homogeneous={true}
                        orientation={Gtk.Orientation.VERTICAL}>
                        <label
                            halign={Gtk.Align.START}
                            valign={Gtk.Align.END}
                            className="description"
                            label={bind(weather, "description")} />
                        <label
                            halign={Gtk.Align.START}
                            valign={Gtk.Align.START}
                            className="temperature"
                            label={bind(weather, "temperature").as(temperature => `${(temperature - 273.15).toFixed(1)}°C`)} />
                    </box>
                </box>
                <revealer
                    revealChild={reveal()}
                    transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}>
                    <box
                        className="footer"
                        homogeneous={true}>
                        <label
                            halign={Gtk.Align.START}
                            label={bind(weather, "windspeed").as(windspeed => `${windspeed}km/h`)} />
                        <label
                            halign={Gtk.Align.END}
                            label={bind(weather, "feels_like").as(feels_like => `${(feels_like - 273.15).toFixed(1)}°C`)} />
                    </box>
                </revealer>
            </box>
        </eventbox>
    );
}

function PowerInfo() {
    const powerprofiles = AstalPowerProfiles.get_default();

    const uptime = Variable(0).poll(
        1000,
        () => readFileAsync("/proc/uptime")
            .then(res => parseInt(res))
            .catch(_ => 0),
    );

    return (
        <eventbox
            className="power"
            onClick={(_, e) => {
                switch (e.button) {
                    case Astal.MouseButton.PRIMARY:
                        switch (powerprofiles.get_active_profile()) {
                            case "power-saver":
                                powerprofiles.set_active_profile("balanced");
                                break;

                            case "balanced":
                                powerprofiles.set_active_profile("performance");
                                break;

                            case "performance":
                                powerprofiles.set_active_profile("power-saver");
                                break;

                            default:
                                break;
                        }
                        break;

                    default:
                        break;
                }
            }}>
            <box
                halign={Gtk.Align.END}
                spacing={5}>
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
        </eventbox>
    );
}

function Network() {
    const network = AstalNetwork.get_default();

    const scanning: Variable<boolean> = Variable(false);
    let scanner: Variable<null> = Variable(null);

    let access_points: Variable<JSX.Element[]> = Variable([]);
    const selected_access_point: Variable<AstalNetwork.AccessPoint | null> = Variable(null);

    let ssid: Variable<string | null> = Variable(null);
    let icon = Variable("network-wireless-signal-none-symbolic");
    let internet: Variable<string> = Variable("disconnected");

    const flight_mode: Variable<boolean> = Variable(false);
    execAsync(["nmcli", "-t", "radio", "all"]).then(res => flight_mode.set(res.includes("disabled")));
    flight_mode.subscribe((flight_mode) => {
        execAsync(["nmcli", "radio", "all", flight_mode ? "off" : "on"]);
        scanning.set(!flight_mode);
    });

    if (network.wifi) {
        scanner = Variable.derive(
            [bind(network.wifi, "scanning"), scanning],
            (wifi_scanning, ui_scanning) => {
                if (!wifi_scanning && ui_scanning && network.wifi.enabled) {
                    network.wifi.scan();
                }

                return null;
            },
        );

        access_points = Variable.derive(
            [bind(network.wifi, "access_points")],
            (access_points) => {
                return access_points
                    .sort((a, b) => b.get_strength() - a.get_strength())
                    .map((access_point) => {
                        const entry = (
                            <entry
                                hexpand={true}
                                placeholder_text="Enter Password..."
                                focus_on_click={true}
                                onActivate={async (self) => {
                                    await execAsync(["nmcli", ""]);
                                    execAsync(["nmcli", "device", "wifi", "connect", access_point.ssid, "password", self.get_text()])
                                        .catch(() => {});
                                }} />
                        );

                        return (
                            <box
                                orientation={Gtk.Orientation.VERTICAL}
                                spacing={5}>
                                <button
                                    className="entry"
                                    hexpand={true}
                                    onClick={async (_, e) => {
                                        switch (e.button) {
                                            case Astal.MouseButton.PRIMARY:
                                                // stop scanning
                                                scanning.set(false);

                                                const is_open = await execAsync(["nmcli", "-t", "-f", "SECURITY", "device", "wifi", "list", "bssid", access_point.bssid])
                                                    .then(res => res === "");
                                                const remembered = await execAsync(["nmcli", "-t", "-f", "NAME", "connection", "show"])
                                                    .then(res => res.split("\n"));

                                                if (is_open || remembered.includes(access_point.ssid)) {
                                                    const success = await execAsync(["nmcli", "device", "wifi", "connect", access_point.ssid])
                                                        .then(() => true)
                                                        .catch(() => false);

                                                    if (success) {
                                                        return;
                                                    }
                                                }

                                                if (selected_access_point.get()?.ssid === access_point.get_ssid()) {
                                                    selected_access_point.set(null);
                                                }
                                                else {
                                                    selected_access_point.set(access_point);
                                                }
                                                break;

                                            default:
                                                break;
                                        }
                                    }}>
                                    <box>
                                        <icon className="icon" icon={access_point?.get_icon_name()} />
                                        <label className="value" label={truncate(access_point?.get_ssid() || "Unknown", 15)} />
                                    </box>
                                </button>
                                <revealer
                                    transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
                                    revealChild={selected_access_point().as(selected_access_point => selected_access_point?.ssid === access_point?.get_ssid())}>
                                    {entry}
                                </revealer>
                            </box>
                        );
                    });
            },
        );

        ssid = Variable.derive(
            [bind(network.wifi, "active_access_point")],
            active_access_point => active_access_point?.get_ssid() || null,
        );

        icon = Variable.derive(
            [bind(network.wifi, "icon_name")],
            icon_name => icon_name,
        );

        internet = Variable.derive(
            [bind(network.wifi, "internet"), ssid],
            (internet, ssid) => {
                // connectivity isnt updated properly sometimes
                if (ssid === null) {
                    return "failed";
                }

                switch (internet) {
                    case AstalNetwork.Internet.DISCONNECTED:
                        return "failed";

                    case AstalNetwork.Internet.CONNECTED:
                        return "success";

                    case AstalNetwork.Internet.CONNECTING:
                        return "waiting";

                    default:
                        return "failed";
                }
            },
        );
    }

    if (network.wired) {
        ssid = Variable("Wired");

        icon = Variable.derive(
            [bind(network.wired, "icon_name")],
            icon_name => icon_name,
        );

        internet = Variable.derive(
            [bind(network.wired, "internet"), ssid],
            (internet, ssid) => {
                // connectivity isnt updated properly sometimes
                if (ssid === null) {
                    return "failed";
                }

                switch (internet) {
                    case AstalNetwork.Internet.DISCONNECTED:
                        return "failed";

                    case AstalNetwork.Internet.CONNECTED:
                        return "success";

                    case AstalNetwork.Internet.CONNECTING:
                        return "waiting";

                    default:
                        return "failed";
                }
            },
        );
    }

    return (
        <box
            name="network"
            className="network"
            orientation={Gtk.Orientation.VERTICAL}
            spacing={10}
            onDestroy={() => {
                scanner.drop();
                icon.drop();
                ssid.drop();
                access_points.drop();
                internet.drop();
            }}>
            <box
                hexpand={true}
                spacing={10}
                className="settings-box">
                <button
                    className={scanning().as(scanning => scanning ? "success" : "failed")}
                    onClick={() => {
                        if (flight_mode.get()) {
                            return;
                        }

                        scanning.set(!scanning.get());
                    }}>
                    <icon icon="search-symbolic" />
                </button>
                <button
                    className={internet()}>
                    <box
                        spacing={10}>
                        <icon icon={icon()} />
                        <label label={ssid().as(ssid => truncate(ssid || "Disconnected", 15))} />
                    </box>
                </button>

                <button
                    className={flight_mode().as(flight_mode => flight_mode ? "success" : "")}
                    onClick={async (_, e) => {
                        switch (e.button) {
                            case Astal.MouseButton.PRIMARY:
                                flight_mode.set(!flight_mode.get());
                                break;

                            default:
                                break;
                        }
                    }}>
                    <box
                        spacing={10}>
                        <label label=" " />
                        <label label="Flight Mode" />
                    </box>
                </button>
            </box>

            <Separator />

            <scrollable
                vexpand={true}>
                <box
                    spacing={10}
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
            <WeatherInfo />
            <PowerInfo />
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
            keymode={Astal.Keymode.ON_DEMAND}
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
