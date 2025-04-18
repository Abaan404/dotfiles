import { App, Astal, Gtk, Gdk } from "astal/gtk4";
import { GLib, Variable, bind, execAsync } from "astal";
import { Gio, readFileAsync } from "astal/file";

import AstalNetwork from "gi://AstalNetwork";
import AstalPowerProfiles from "gi://AstalPowerProfiles";
import AstalBluetooth from "gi://AstalBluetooth";
import AstalBattery from "gi://AstalBattery";
import Weather from "../services/weather";

import { ScrolledWindow, Calendar, Picture, Separator } from "../utils/widgets";

import { MouseButton } from "../utils/inputs";
import { get_active_profile_name, get_internet_name, to_timestamp, truncate } from "../utils/strings";

function WeatherInfo() {
    const weather = Weather.get_default();

    const reveal = Variable(false);

    return (
        <button
            cssClasses={["weather"]}
            hexpand={true}
            onHoverEnter={() => reveal.set(true)}
            onHoverLeave={() => reveal.set(false)}
            onButtonPressed={(_, e) => {
                switch (e.get_button()) {
                    case MouseButton.PRIMARY:
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
                    <box>
                        <Picture
                            cssClasses={["icon"]}
                            file={bind(weather, "image_path").as(image_path => Gio.File.new_for_path(image_path))} />
                    </box>
                    <box
                        homogeneous={true}
                        orientation={Gtk.Orientation.VERTICAL}>
                        <label
                            halign={Gtk.Align.START}
                            valign={Gtk.Align.END}
                            cssClasses={["description"]}
                            label={bind(weather, "description")} />
                        <label
                            halign={Gtk.Align.START}
                            valign={Gtk.Align.START}
                            cssClasses={["temperature"]}
                            label={bind(weather, "temperature").as(temperature => `${(temperature - 273.15).toFixed(1)}°C`)} />
                    </box>
                </box>
                <revealer
                    revealChild={reveal()}
                    transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}>
                    <box
                        cssClasses={["footer"]}
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
        </button>
    );
}

function PowerInfo() {
    const powerprofiles = AstalPowerProfiles.get_default();

    const uptime = Variable(0).poll(1000, () => readFileAsync("/proc/uptime")
        .then(res => parseInt(res))
        .catch(_ => 0));

    return (
        <button
            cssClasses={["power"]}
            onButtonPressed={(_, e) => {
                switch (e.get_button()) {
                    case MouseButton.PRIMARY:
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
                        cssClasses={["mode"]}
                        valign={Gtk.Align.END}
                        halign={Gtk.Align.END}
                        label={bind(powerprofiles, "active_profile").as(active_profile => get_active_profile_name(active_profile))} />
                    <label
                        cssClasses={["uptime"]}
                        valign={Gtk.Align.CENTER}
                        halign={Gtk.Align.END}
                        label={uptime().as(uptime => `uptime: ${to_timestamp(uptime)}`)} />
                </box>
                <image pixelSize={46} cssClasses={["icon"]} iconName={bind(powerprofiles, "icon_name")} />
            </box>
        </button>
    );
}

function Network() {
    const network = AstalNetwork.get_default();

    const wired = network.get_wired();
    const wifi = network.get_wifi();

    if (!wifi && !wired) {
        return (
            <box
                name="network"
                cssClasses={["network"]}
                homogeneous={true}
                hexpand={true}
                vexpand={true}>
                <label
                    cssClasses={["nodevice"]}
                    valign={Gtk.Align.CENTER}
                    halign={Gtk.Align.CENTER}
                    label="No Network Device Found" />
            </box>
        );
    }

    const scanning: Variable<boolean> = Variable(false);
    let scanner: Variable<null> = Variable(null);

    let access_points: Variable<JSX.Element[]> = Variable([]);
    const selected_access_point: Variable<AstalNetwork.AccessPoint | null> = Variable(null);

    let ssid: Variable<string | null> = Variable(null);
    let icon = Variable("network-wireless-signal-none-symbolic");
    let internet: Variable<string[]> = Variable(["disconnected"]);

    const flight_mode: Variable<boolean> = Variable(false);
    execAsync(["nmcli", "-t", "radio", "all"]).then(res => flight_mode.set(res.includes("disabled")));
    flight_mode.subscribe((flight_mode) => {
        execAsync(["nmcli", "radio", "all", flight_mode ? "off" : "on"]);
        scanning.set(!flight_mode);
    });

    if (wifi) {
        scanner = Variable.derive(
            [bind(wifi, "scanning"), scanning],
            (wifi_scanning, ui_scanning) => {
                if (!wifi_scanning && ui_scanning && wifi.get_enabled()) {
                    wifi.scan();
                }

                return null;
            },
        );

        access_points = Variable.derive(
            [bind(wifi, "access_points")],
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
                                    const ssid = access_point.get_ssid();
                                    if (ssid) {
                                        execAsync(["nmcli", "device", "wifi", "connect", ssid, "password", self.get_text()])
                                            .catch(() => {});
                                    }
                                }} />
                        );

                        return (
                            <box
                                orientation={Gtk.Orientation.VERTICAL}
                                spacing={5}>
                                <button
                                    cssClasses={["entry"]}
                                    hexpand={true}
                                    onButtonPressed={async (_, e) => {
                                        switch (e.get_button()) {
                                            case MouseButton.PRIMARY:
                                                // stop scanning
                                                scanning.set(false);

                                                const is_open = await execAsync(["nmcli", "-t", "-f", "SECURITY", "device", "wifi", "list", "bssid", access_point.get_bssid()])
                                                    .then(res => res === "");
                                                const remembered = await execAsync(["nmcli", "-t", "-f", "NAME", "connection", "show"])
                                                    .then(res => res.split("\n"));

                                                const ssid = access_point.get_ssid();
                                                if (ssid && (is_open || remembered.includes(ssid))) {
                                                    const success = await execAsync(["nmcli", "device", "wifi", "connect", ssid])
                                                        .then(() => true)
                                                        .catch(() => false);

                                                    if (success) {
                                                        return;
                                                    }
                                                }

                                                if (selected_access_point.get()?.get_ssid() === access_point.get_ssid()) {
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
                                        <image cssClasses={["icon"]} iconName={access_point?.get_icon_name()} />
                                        <label cssClasses={["value"]} label={truncate(access_point?.get_ssid() || "Unknown", 15)} />
                                    </box>
                                </button>
                                <revealer
                                    transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
                                    revealChild={selected_access_point().as(selected_access_point => selected_access_point?.get_ssid() === access_point?.get_ssid())}>
                                    {entry}
                                </revealer>
                            </box>
                        );
                    });
            },
        );

        ssid = Variable.derive(
            [bind(wifi, "active_access_point")],
            active_access_point => active_access_point?.get_ssid() || null,
        );

        icon = Variable.derive(
            [bind(wifi, "icon_name")],
            icon_name => icon_name,
        );

        internet = Variable.derive(
            [bind(wifi, "internet"), ssid],
            (internet, ssid) => {
                // connectivity isnt updated properly sometimes
                if (ssid === null) {
                    return ["failed"];
                }

                return [get_internet_name(internet)];
            },
        );
    }

    if (wired) {
        ssid = Variable("Wired");

        icon = Variable.derive(
            [bind(wired, "icon_name")],
            icon_name => icon_name,
        );

        internet = Variable.derive(
            [bind(wired, "internet"), ssid],
            (internet, ssid) => {
                // connectivity isnt updated properly sometimes
                if (ssid === null) {
                    return ["failed"];
                }

                return [get_internet_name(internet)];
            },
        );
    }

    return (
        <box
            name="network"
            cssClasses={["network"]}
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
                cssClasses={["settings-box"]}>
                <button
                    cssClasses={scanning().as(scanning => scanning ? ["success"] : [""])}
                    onButtonPressed={() => {
                        if (flight_mode.get()) {
                            return;
                        }

                        scanning.set(!scanning.get());
                    }}>
                    <image iconName="search-symbolic" />
                </button>
                <button
                    cssClasses={flight_mode().as(flight_mode => flight_mode ? ["success"] : [""])}
                    onButtonPressed={async (_, e) => {
                        switch (e.get_button()) {
                            case MouseButton.PRIMARY:
                                flight_mode.set(!flight_mode.get());
                                break;

                            default:
                                break;
                        }
                    }}>
                    <box
                        spacing={10}>
                        <label label=" " />
                    </box>
                </button>
                <button
                    cssClasses={internet()}
                    hexpand={true}>
                    <box
                        halign={Gtk.Align.CENTER}
                        spacing={10}>
                        <image iconName={icon()} />
                        <label label={ssid().as(ssid => truncate(ssid || "Disconnected", 15))} />
                    </box>
                </button>
            </box>

            <Separator />

            <ScrolledWindow
                vexpand={true}>
                <box
                    spacing={10}
                    orientation={Gtk.Orientation.VERTICAL}>
                    {access_points()}
                </box>
            </ScrolledWindow>
        </box>
    );
}

function Bluetooth() {
    const bluetooth = AstalBluetooth.get_default();
    const adapter = bluetooth.get_adapter();

    if (!adapter) {
        return (
            <box
                name="bluetooth"
                cssClasses={["bluetooth"]}
                homogeneous={true}
                hexpand={true}
                vexpand={true}>
                <label
                    cssClasses={["nodevice"]}
                    valign={Gtk.Align.CENTER}
                    halign={Gtk.Align.CENTER}
                    label="No Bluetooth Adapter Found" />
            </box>
        );
    }

    adapter.set_discoverable_timeout(600);

    const devices = Variable(bluetooth.get_devices());
    bind(bluetooth, "is_powered").subscribe(() => devices.set([]));
    bluetooth.connect("device-added", () => devices.set(bluetooth.get_devices()));
    bluetooth.connect("device-removed", () => devices.set(bluetooth.get_devices()));

    return (
        <box
            onDestroy={() => {
                devices.drop();
            }}
            name="bluetooth"
            cssClasses={["bluetooth"]}
            orientation={Gtk.Orientation.VERTICAL}
            spacing={10}>
            <box
                hexpand={true}
                spacing={10}
                cssClasses={["settings-box"]}>
                <button
                    cssClasses={bind(adapter, "discovering").as(discovering => discovering ? ["success"] : [""])}
                    onButtonPressed={(_, e) => {
                        switch (e.get_button()) {
                            case MouseButton.PRIMARY:
                                if (adapter.get_discovering()) {
                                    adapter.stop_discovery();
                                }
                                else {
                                    adapter.start_discovery();
                                }
                                break;

                            default:
                                break;
                        }
                    }}>
                    <image iconName="search-symbolic" />
                </button>
                <button
                    cssClasses={bind(adapter, "discoverable").as(discoverable => discoverable ? ["success"] : [""])}
                    onButtonPressed={async (_, e) => {
                        switch (e.get_button()) {
                            case MouseButton.PRIMARY:
                                adapter.set_discoverable(!adapter.get_discoverable());
                                break;

                            default:
                                break;
                        }
                    }}>
                    <image iconName="blueman-pair-symbolic" />
                </button>
                <button
                    cssClasses={bind(bluetooth, "is_powered").as(is_powered => is_powered ? [""] : ["failed"])}
                    hexpand={true}
                    onButtonPressed={(_, e) => {
                        switch (e.get_button()) {
                            case MouseButton.PRIMARY:
                                bluetooth.toggle();
                                break;

                            default:
                                break;
                        }
                    }}>
                    <box
                        halign={Gtk.Align.CENTER}
                        spacing={10}>
                        <image iconName="bluetooth-symbolic" />
                        <label label={bind(bluetooth, "is_connected").as(connected => connected ? "Connected" : "Disconnected")} />
                    </box>
                </button>
            </box>

            <Separator />

            <ScrolledWindow
                vexpand={true}>
                <box
                    spacing={10}
                    orientation={Gtk.Orientation.VERTICAL}>
                    {devices().as(devices => devices
                        .filter(device => device.get_alias().replaceAll("-", ":") !== device.get_address())
                        .map(device => (
                            <button
                                cssClasses={bind(device, "connected").as(connected => connected ? ["entry", "active"] : ["entry"])}
                                hexpand={true}
                                onButtonPressed={async () => {
                                    // TODO: handle pairing
                                    if (device.get_connected()) {
                                        Gio._promisify(AstalBluetooth.Device.prototype, "disconnect_device", "disconnect_device_finish");
                                        await device.disconnect_device();
                                    }
                                    else {
                                        Gio._promisify(AstalBluetooth.Device.prototype, "connect_device", "connect_device_finish");
                                        await device.connect_device();
                                    }
                                }}>
                                <box
                                    spacing={5}>
                                    <image cssClasses={["icon"]} iconName="bluetooth-symbolic" />
                                    <label cssClasses={["value"]} label={device.get_alias()} />
                                </box>
                            </button>
                        )),
                    )}
                </box>
            </ScrolledWindow>
        </box>
    );
}

function TimeAndDate() {
    const time = (format: string) => Variable("").poll(1000, () =>
        GLib.DateTime.new_now_local().format(format)!);

    return (
        <box
            name="calendar"
            cssClasses={["calendar"]}
            orientation={Gtk.Orientation.VERTICAL}>
            <label
                cssClasses={["clock"]}
                label={time("%H : %M : %S")()} />
            <Calendar
                vexpand={true}
                valign={Gtk.Align.END} />
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
            cssClasses={["quick-settings"]}
            spacing={20}>
            <stack
                visibleChildName={page()}
                transitionType={Gtk.StackTransitionType.SLIDE_UP_DOWN}>
                <Network />
                <Bluetooth />
                <TimeAndDate />
            </stack>
            <box
                cssClasses={["controls"]}
                spacing={20}
                valign={Gtk.Align.FILL}
                orientation={Gtk.Orientation.VERTICAL}
                homogeneous={true}>
                <button
                    onButtonPressed={(_, e) => e.get_button() === MouseButton.PRIMARY ? page.set("network") : null}>
                    <overlay>
                        {bind(network, "primary").as((primary) => {
                            const wired = network.get_wired();
                            const wifi = network.get_wifi();

                            if (primary === AstalNetwork.Primary.WIRED && wired) {
                                return <image type="overlay" iconName={bind(wired, "icon_name").as(icon_name => icon_name)} />;
                            }

                            else if (primary === AstalNetwork.Primary.WIFI && wifi) {
                                return <image type="overlay" iconName={bind(wifi, "icon_name").as(icon_name => icon_name)} />;
                            }

                            else {
                                return <image type="overlay" iconName="network-wireless-signal-none-symbolic" />;
                            }
                        })}
                        <slider
                            inverted={true}
                            min={0}
                            max={1}
                            value={bind(network, "connectivity").as(connectivity => connectivity === AstalNetwork.Connectivity.FULL ? 1 : 0)} />
                    </overlay>
                </button>
                <button onButtonPressed={(_, e) => e.get_button() === MouseButton.PRIMARY ? page.set("bluetooth") : null}>
                    <overlay>
                        <image type="overlay" iconName="bluetooth-symbolic" />
                        <slider
                            inverted={true}
                            min={0}
                            max={1}
                            value={bind(bluetooth, "is_connected").as(is_connected => is_connected ? 1 : 0)} />
                    </overlay>
                </button>
                <button>
                    <overlay>
                        <image type="overlay" iconName={bind(battery, "icon_name")} />
                        <slider
                            orientation={Gtk.Orientation.VERTICAL}
                            inverted={true}
                            min={0}
                            max={1}
                            value={bind(battery, "percentage")} />
                    </overlay>
                </button>
                <button onButtonPressed={(_, e) => e.get_button() === MouseButton.PRIMARY ? page.set("calendar") : null}>
                    <box>
                        <overlay>
                            <image type="overlay" iconName="timer-symbolic" />
                            <slider
                                orientation={Gtk.Orientation.VERTICAL}
                                inverted={true}
                                min={0}
                                max={1}
                                value={day_percent()}>
                            </slider>
                        </overlay>
                    </box>
                </button>
            </box>
        </box>
    );
}

function QuickInfo() {
    return (
        <box
            widthRequest={300}
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
            heightRequest={300}
            spacing={20}>
            <QuickInfo />
            <QuickSettings />
        </box>
    );
}

export default function (gdkmonitor: Gdk.Monitor) {
    return (
        <window
            setup={self => self.set_default_size(-1, -1)}
            keymode={Astal.Keymode.ON_DEMAND}
            name="glance"
            cssClasses={["glance"]}
            gdkmonitor={gdkmonitor}
            visible={true}
            anchor={Astal.WindowAnchor.RIGHT
                | Astal.WindowAnchor.TOP}
            application={App}>
            <box
                cssClasses={["layout-box"]}
                spacing={10}
                orientation={Gtk.Orientation.VERTICAL}>
                <RowOne />
            </box>
        </window>
    ) as Astal.Window;
}
