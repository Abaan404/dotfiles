import Gio from "gi://Gio";
import App from "ags/gtk4/app";
import { Astal, Gtk, Gdk } from "ags/gtk4";
import { createState, createBinding, onCleanup, createComputed, For, With } from "ags";
import { readFileAsync } from "ags/file";
import { execAsync } from "ags/process";

import AstalNetwork from "gi://AstalNetwork";
import AstalPowerProfiles from "gi://AstalPowerProfiles";
import AstalBluetooth from "gi://AstalBluetooth";
import AstalBattery from "gi://AstalBattery";
import AstalNotifd from "gi://AstalNotifd";
import Weather from "../services/weather";

import { Notification } from "../components/Notification";

import { get_active_profile_name, get_internet_name, to_timestamp, truncate } from "../utils/helpers";
import { createPoll } from "ags/time";
import GLib from "gi://GLib";

function WeatherInfo() {
    const weather = Weather.get_default();

    const [reveal, set_reveal] = createState(false);

    return (
        <button
            class="weather"
            hexpand={true}
            onClicked={() => execAsync(["xdg-open", `https://openweathermap.org/city/${weather.city_id}`])}>
            <Gtk.EventControllerMotion
                onEnter={() => set_reveal(true)}
                onLeave={() => set_reveal(false)} />
            <box
                orientation={Gtk.Orientation.VERTICAL}>
                <box
                    spacing={10}
                    halign={Gtk.Align.START}>
                    <box>
                        <Gtk.Picture
                            class="icon"
                            file={createBinding(weather, "image_path").as(image_path => Gio.File.new_for_path(image_path))} />
                    </box>
                    <box
                        homogeneous={true}
                        orientation={Gtk.Orientation.VERTICAL}>
                        <label
                            halign={Gtk.Align.START}
                            valign={Gtk.Align.END}
                            class="description"
                            label={createBinding(weather, "description")} />
                        <label
                            halign={Gtk.Align.START}
                            valign={Gtk.Align.START}
                            class="temperature"
                            label={createBinding(weather, "temperature").as(temperature => `${(temperature - 273.15).toFixed(1)}°C`)} />
                    </box>
                </box>
                <revealer
                    revealChild={reveal}
                    transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}>
                    <box
                        class="footer"
                        homogeneous={true}>
                        <label
                            halign={Gtk.Align.START}
                            label={createBinding(weather, "windspeed").as(windspeed => `${windspeed}km/h`)} />
                        <label
                            halign={Gtk.Align.END}
                            label={createBinding(weather, "feels_like").as(feels_like => `${(feels_like - 273.15).toFixed(1)}°C`)} />
                    </box>
                </revealer>
            </box>
        </button>
    );
}

function PowerInfo() {
    const powerprofiles = AstalPowerProfiles.get_default();

    const uptime = createPoll(0, 1000, () => readFileAsync("/proc/uptime")
        .then(res => parseInt(res))
        .catch(_ => 0));

    return (
        <button
            class="power"
            onClicked={() => {
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
            }}>
            <box
                halign={Gtk.Align.END}
                spacing={5}>
                <box
                    orientation={Gtk.Orientation.VERTICAL}
                    homogeneous={true}>
                    <label
                        class="mode"
                        valign={Gtk.Align.END}
                        halign={Gtk.Align.END}
                        label={createBinding(powerprofiles, "active_profile").as(active_profile => get_active_profile_name(active_profile))} />
                    <label
                        class="uptime"
                        valign={Gtk.Align.CENTER}
                        halign={Gtk.Align.END}
                        label={uptime(uptime => `uptime: ${to_timestamp(uptime)}`)} />
                </box>
                <image pixelSize={46} class="icon" iconName={createBinding(powerprofiles, "icon_name")} />
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
                $type="named"
                name="network"
                class="network"
                homogeneous={true}
                hexpand={true}
                vexpand={true}>
                <label
                    class="nodevice"
                    valign={Gtk.Align.CENTER}
                    halign={Gtk.Align.CENTER}
                    label="No Network Device Found" />
            </box>
        );
    }

    const [scanning, set_scanning] = createState(false);
    let [scanner] = createState(null);

    let [access_points] = createState<AstalNetwork.AccessPoint[]>([]);
    const [selected_access_point, set_selected_access_point] = createState<AstalNetwork.AccessPoint | null>(null);

    let [ssid, set_ssid] = createState<string | null>(null);
    let [icon] = createState("network-wireless-signal-none-symbolic");
    let [internet] = createState("disconnected");

    const [flight_mode, set_flight_mode] = createState<boolean>(false);
    execAsync(["nmcli", "-t", "radio", "all"]).then(res => set_flight_mode(res.includes("disabled")));

    const dispose = flight_mode.subscribe(() => {
        execAsync(["nmcli", "radio", "all", flight_mode.get() ? "off" : "on"]);

        if (flight_mode.get()) {
            set_scanning(false);
        }
    });

    onCleanup(() => dispose());

    if (wifi) {
        scanner = createComputed(
            [createBinding(wifi, "scanning"), scanning],
            (wifi_scanning, ui_scanning) => {
                if (!wifi_scanning && ui_scanning && wifi.get_enabled()) {
                    wifi.scan();
                }

                return null;
            },
        );

        access_points = createComputed(
            [createBinding(wifi, "access_points")],
            (access_points) => {
                return access_points
                    .sort((a, b) => b.get_strength() - a.get_strength());
            },
        );

        ssid = createComputed(
            [createBinding(wifi, "active_access_point")],
            active_access_point => active_access_point?.get_ssid() || null,
        );

        icon = createComputed(
            [createBinding(wifi, "icon_name")],
            icon_name => icon_name,
        );

        internet = createComputed(
            [createBinding(wifi, "internet"), ssid],
            (internet, ssid) => {
                // connectivity isnt updated properly sometimes
                if (ssid === null) {
                    return "failed";
                }

                return get_internet_name(internet);
            },
        );
    }

    if (wired) {
        [ssid, set_ssid] = createState<string | null>("Wired");

        icon = createComputed(
            [createBinding(wired, "icon_name")],
            icon_name => icon_name,
        );

        internet = createComputed(
            [createBinding(wired, "internet"), ssid],
            (internet, ssid) => {
                // connectivity isnt updated properly sometimes
                if (ssid === null) {
                    return "failed";
                }

                return get_internet_name(internet);
            },
        );
    }

    return (
        <box
            $type="named"
            name="network"
            class="network"
            orientation={Gtk.Orientation.VERTICAL}
            spacing={10}>
            <box
                hexpand={true}
                spacing={10}
                class="settings-box">
                <button
                    class={scanning(scanning => scanning ? "success" : "")}
                    onClicked={() => {
                        if (flight_mode.get()) {
                            return;
                        }

                        set_scanning(!scanning.get());
                    }}>
                    <image iconName="search-symbolic" />
                </button>
                <button
                    class={flight_mode(flight_mode => flight_mode ? "success" : "")}
                    onClicked={() => set_flight_mode(!flight_mode.get())}>
                    <box
                        spacing={10}>
                        <label label=" " />
                    </box>
                </button>
                <button
                    class={internet}
                    hexpand={true}
                    onClicked={() => wifi?.set_enabled(!wifi.get_enabled())}>
                    <box
                        halign={Gtk.Align.CENTER}
                        spacing={10}>
                        <image iconName={icon} />
                        <label label={ssid(ssid => truncate(ssid || "Disconnected", 15))} />
                    </box>
                </button>
            </box>

            <Gtk.Separator />

            <Gtk.ScrolledWindow
                vexpand={true}>
                <box
                    spacing={10}
                    orientation={Gtk.Orientation.VERTICAL}>
                    <For each={access_points}>
                        {(access_point) => {
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
                                        class="entry"
                                        hexpand={true}
                                        onClicked={async () => {
                                        // stop scanning
                                            set_scanning(false);

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
                                                set_selected_access_point(null);
                                            }
                                            else {
                                                set_selected_access_point(access_point);
                                            }
                                        }}>
                                        <box>
                                            <image class="icon" iconName={access_point?.get_icon_name()} />
                                            <label class="value" label={truncate(access_point?.get_ssid() || "Unknown", 15)} />
                                        </box>
                                    </button>
                                    <revealer
                                        transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
                                        revealChild={selected_access_point(selected_access_point => selected_access_point?.get_ssid() === access_point?.get_ssid())}>
                                        {entry}
                                    </revealer>
                                </box>
                            );
                        }}
                    </For>
                </box>
            </Gtk.ScrolledWindow>
        </box>
    );
}

function Bluetooth() {
    const bluetooth = AstalBluetooth.get_default();
    const adapter = bluetooth.get_adapter();

    if (!adapter) {
        return (
            <box
                $type="named"
                name="bluetooth"
                class="bluetooth"
                homogeneous={true}
                hexpand={true}
                vexpand={true}>
                <label
                    class="nodevice"
                    valign={Gtk.Align.CENTER}
                    halign={Gtk.Align.CENTER}
                    label="No Bluetooth Adapter Found" />
            </box>
        );
    }

    adapter.set_discoverable_timeout(600);

    const [devices, set_devices] = createState(bluetooth.get_devices());
    createBinding(bluetooth, "is_powered").subscribe(() => set_devices([]));
    bluetooth.connect("device-added", () => set_devices(bluetooth.get_devices()));
    bluetooth.connect("device-removed", () => set_devices(bluetooth.get_devices()));

    return (
        <box
            $type="named"
            name="bluetooth"
            class="bluetooth"
            orientation={Gtk.Orientation.VERTICAL}
            spacing={10}>
            <box
                hexpand={true}
                spacing={10}
                class="settings-box">
                <button
                    class={createBinding(adapter, "discovering").as(discovering => discovering ? "success" : "")}
                    onClicked={() => {
                        if (adapter.get_discovering()) {
                            adapter.stop_discovery();
                        }
                        else {
                            adapter.start_discovery();
                        }
                    }}>
                    <image iconName="search-symbolic" />
                </button>
                <button
                    class={createBinding(adapter, "discoverable").as(discoverable => discoverable ? "success" : "")}
                    onClicked={() => adapter.set_discoverable(!adapter.get_discoverable())}>
                    <image iconName="blueman-pair-symbolic" />
                </button>
                <button
                    class={createBinding(bluetooth, "is_powered").as(is_powered => is_powered ? "" : "failed")}
                    hexpand={true}
                    onClicked={() => bluetooth.toggle()}>
                    <box
                        halign={Gtk.Align.CENTER}
                        spacing={10}>
                        <image iconName="bluetooth-symbolic" />
                        <label label={createBinding(bluetooth, "is_connected").as(connected => connected ? "Connected" : "Disconnected")} />
                    </box>
                </button>
            </box>

            <Gtk.Separator />

            <Gtk.ScrolledWindow
                vexpand={true}>
                <box
                    spacing={10}
                    orientation={Gtk.Orientation.VERTICAL}>
                    <For each={devices(devices => devices.filter(device => device.get_alias().replaceAll("-", ":") !== device.get_address()))}>
                        {(device: AstalBluetooth.Device) => (
                            <button
                                class={createBinding(device, "connected").as(connected => connected ? "entry active" : "entry")}
                                hexpand={true}
                                onClicked={async () => {
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
                                    <image class="icon" iconName="bluetooth-symbolic" />
                                    <label class="value" label={device.get_alias()} />
                                </box>
                            </button>
                        )}
                    </For>
                </box>
            </Gtk.ScrolledWindow>
        </box>
    );
}

function TimeAndDate() {
    const time = (format: string) => createPoll("", 1000, () =>
        GLib.DateTime.new_now_local().format(format)!);

    return (
        <box
            $type="named"
            name="calendar"
            class="calendar"
            orientation={Gtk.Orientation.VERTICAL}>
            <label
                class="clock"
                label={time("%H : %M : %S")} />
            <Gtk.Calendar
                vexpand={true}
                valign={Gtk.Align.END} />
        </box>
    );
}

function QuickSettings() {
    const [page, set_page] = createState("calendar");

    const network = AstalNetwork.get_default();
    const bluetooth = AstalBluetooth.get_default();
    const battery = AstalBattery.get_default();

    const day_percent = createPoll(
        parseInt(GLib.DateTime.new_now_local().format("%H")!) / 24,
        60000,
        () => parseInt(GLib.DateTime.new_now_local().format("%H")!) / 24,
    );

    return (
        <box
            class="quick-settings"
            spacing={20}>
            <stack
                $={(self) => {
                    self.set_visible_child_name(page.get());
                    const dispose = page.subscribe(() => self.set_visible_child_name(page.get()));
                    onCleanup(() => dispose());
                }}
                transitionType={Gtk.StackTransitionType.SLIDE_UP_DOWN}>
                <Network />
                <Bluetooth />
                <TimeAndDate />
            </stack>
            <box
                class="controls"
                spacing={20}
                valign={Gtk.Align.FILL}
                orientation={Gtk.Orientation.VERTICAL}
                homogeneous={true}>
                <button
                    onClicked={() => set_page("network")}>
                    <With value={createBinding(network, "primary")}>
                        {(primary: AstalNetwork.Primary) => {
                            const wired = network.get_wired();
                            const wifi = network.get_wifi();
                            const slider = (
                                <slider
                                    orientation={Gtk.Orientation.VERTICAL}
                                    inverted={true}
                                    min={0}
                                    max={1}
                                    value={createBinding(network, "connectivity").as(connectivity => connectivity === AstalNetwork.Connectivity.FULL ? 1 : 0)} />
                            );

                            if (primary === AstalNetwork.Primary.WIRED && wired) {
                                return (
                                    <overlay>
                                        {slider}
                                        <image $type="overlay" iconName={createBinding(wired, "icon_name").as(icon_name => icon_name)} />
                                    </overlay>
                                );
                            }

                            else if (primary === AstalNetwork.Primary.WIFI && wifi) {
                                return (
                                    <overlay>
                                        {slider}
                                        <image $type="overlay" iconName={createBinding(wifi, "icon_name").as(icon_name => icon_name)} />
                                    </overlay>
                                );
                            }

                            else {
                                return (
                                    <overlay>
                                        {slider}
                                        <image $type="overlay" iconName="network-wireless-signal-none-symbolic" />
                                    </overlay>
                                );
                            }
                        }}
                    </With>
                </button>
                <button onClicked={() => set_page("bluetooth")}>
                    <With value={createBinding(bluetooth, "is_connected")}>
                        {is_connected => (
                            <overlay>
                                <image $type="overlay" iconName="bluetooth-symbolic" />
                                <slider
                                    orientation={Gtk.Orientation.VERTICAL}
                                    inverted={true}
                                    min={0}
                                    max={1}
                                    value={createBinding(bluetooth.devices[0], "battery_percentage").as(battery_percentage => is_connected ? battery_percentage : 0)} />
                            </overlay>
                        )}
                    </With>
                </button>
                <button>
                    <overlay>
                        <image $type="overlay" iconName={createBinding(battery, "icon_name")} />
                        <slider
                            orientation={Gtk.Orientation.VERTICAL}
                            inverted={true}
                            min={0}
                            max={1}
                            value={createBinding(battery, "percentage")} />
                    </overlay>
                </button>
                <button onClicked={() => set_page("calendar")}>
                    <box>
                        <overlay>
                            <image $type="overlay" iconName="timer-symbolic" />
                            <slider
                                orientation={Gtk.Orientation.VERTICAL}
                                inverted={true}
                                min={0}
                                max={1}
                                value={day_percent}>
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

function NotificationList() {
    const notifd = AstalNotifd.get_default();

    const [notifications, set_notifications] = createState<AstalNotifd.Notification[]>(notifd.get_notifications());
    notifd.connect("notified", () => set_notifications(notifd.get_notifications()));
    notifd.connect("resolved", () => set_notifications(notifd.get_notifications()));

    return (
        <box
            class="notification-list"
            orientation={Gtk.Orientation.VERTICAL}
            heightRequest={300}
            spacing={10}>
            <Gtk.ScrolledWindow
                heightRequest={400}
                vexpand={true}>
                <box
                    spacing={20}
                    orientation={Gtk.Orientation.VERTICAL}>
                    <box
                        orientation={Gtk.Orientation.VERTICAL}
                        spacing={10}>
                        <label
                            class="list-header"
                            halign={Gtk.Align.CENTER}
                            label="Notifications" />
                        <Gtk.Separator />
                    </box>
                    <With value={notifications}>
                        {(notifications) => {
                            if (notifications.length === 0) {
                                return (
                                    <box
                                        class="caught-up"
                                        halign={Gtk.Align.CENTER}
                                        valign={Gtk.Align.CENTER}
                                        orientation={Gtk.Orientation.VERTICAL}
                                        vexpand={true}
                                        spacing={20}>
                                        <image pixelSize={72} iconName="notifications-symbolic" />
                                        <label label="All Caught Up!" />
                                    </box>
                                );
                            }
                        }}
                    </With>
                    <For each={notifications(notifications => notifications.sort((n1, n2) => n2.get_urgency() - n1.get_urgency()))}>
                        {(notification: AstalNotifd.Notification) => <Notification notification={notification} />}
                    </For>
                </box>
            </Gtk.ScrolledWindow>
        </box>
    );
}

export default function (gdkmonitor: Gdk.Monitor) {
    return (
        <window
            $={self => self.set_default_size(1, 1)}
            keymode={Astal.Keymode.ON_DEMAND}
            name="glance"
            class="glance"
            gdkmonitor={gdkmonitor}
            visible={true}
            anchor={Astal.WindowAnchor.RIGHT | Astal.WindowAnchor.TOP}
            application={App}>
            <box
                class="layout-box"
                spacing={10}
                orientation={Gtk.Orientation.VERTICAL}>
                <box
                    halign={Gtk.Align.END}
                    heightRequest={300}
                    spacing={20}>
                    <QuickInfo />
                    <box
                        orientation={Gtk.Orientation.VERTICAL}
                        spacing={20}>
                        <QuickSettings />
                        <NotificationList />
                    </box>
                </box>
            </box>
        </window>
    ) as Astal.Window;
}
