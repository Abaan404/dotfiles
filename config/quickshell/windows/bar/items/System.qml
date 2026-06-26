import QtQuick
import QtQuick.Layouts
import QtQuick.Controls.impl 2.15

import Quickshell
import Quickshell.Io
import Quickshell.Widgets
import Quickshell.Services.UPower
import Quickshell.Networking

import Colors
import Utils

import qs.windows.bar

BarItem {
    id: root

    onClicked: {
        agsProc.running = true;
    }

    RowLayout {
        spacing: 10

        WrapperMouseArea {
            id: battery

            readonly property UPowerDevice device: UPower.devices.values.find(dev => dev.isLaptopBattery) ?? null
            readonly property real percentage: battery?.device?.percentage ?? 0

            visible: device !== null
            propagateComposedEvents: true
            hoverEnabled: true

            onPressed: mouse => mouse.accepted = false

            BarRevealerText {
                text: `${(battery.percentage * 100)}%`
                reveal: battery.containsMouse
                spacingText: 4

                BarText {
                    text: StringsHelper.symbolicStrength(battery.percentage, [" ", " ", " ", " ", " "], 1)

                    color: {
                        if (battery.percentage <= 0.3) {
                            return Colors.bad;
                        }

                        return Colors.text;
                    }
                }
            }
        }

        WrapperMouseArea {
            id: internet

            readonly property WifiDevice wifi: Networking.devices.values.find(dev => dev.type === DeviceType.Wifi && dev.connected) ?? null
            readonly property WiredDevice wired: Networking.devices.values.find(dev => dev.type === DeviceType.Wired && dev.connected) ?? null

            readonly property WifiNetwork wifiNetwork: wifi?.networks.values.find(n => n.connected) ?? null

            readonly property Network wiredNetwork: wired?.network ?? null // qmllint disable unresolved-type

            visible: wifi !== null || wired !== null
            propagateComposedEvents: true
            hoverEnabled: true

            onPressed: mouse => mouse.accepted = false

            BarRevealerText {
                spacingText: 4

                text: {
                    if (internet.wifiNetwork) {
                        return internet.wifiNetwork.name;
                    }

                    if (internet.wiredNetwork) {
                        return internet.wiredNetwork.name;
                    }

                    return "Disconnected";
                }

                reveal: internet.containsMouse

                // https://stackoverflow.com/questions/69964071/qt-qml-colorimage-is-not-a-type
                ColorImage {
                    sourceSize {
                        width: 15
                        height: 15
                    }

                    anchors.centerIn: parent

                    source: {
                        const full = Networking.connectivity === NetworkConnectivity.Full;

                        if (internet.wifi) {
                            if (internet.wifi.state == ConnectionState.Connected) {
                                if (internet.wifi.mode === WifiDeviceMode.AccessPoint) { // qmllint disable unresolved-type
                                    return Quickshell.iconPath("network-wireless-hotspot-symbolic");
                                }

                                if (!full) {
                                    return Quickshell.iconPath("network-wireless-no-route-symbolic");
                                }

                                const strength = internet.wifiNetwork?.signalStrength ?? 0;

                                if (strength === 0) {
                                    return Quickshell.iconPath("network-wireless-signal-none-symbolic")
                                }

                                // qmlformat off
                                const icon = StringsHelper.symbolicStrength(internet.wifiNetwork?.signalStrength ?? 0, [
                                    "network-wireless-signal-excellent-symbolic",
                                    "network-wireless-signal-good-symbolic",
                                    "network-wireless-signal-ok-symbolic",
                                    "network-wireless-signal-weak-symbolic",
                                ], 1);
                                // qmlformat on

                                return Quickshell.iconPath(icon);
                            }

                            if (internet.wifi.state == ConnectionState.Connecting) {
                                return Quickshell.iconPath("network-wireless-acquiring-symbolic");
                            }

                            return Quickshell.iconPath("network-wireless-offline-symbolic");
                        }

                        if (internet.wired) {
                            if (internet.wired.state == ConnectionState.Connecting) {
                                return Quickshell.iconPath("network-wired-acquiring-symbolic");
                            }

                            if (internet.wired.state == ConnectionState.Connected) {
                                if (!full) {
                                    return Quickshell.iconPath("network-wired-no-route-symbolic");
                                }

                                return Quickshell.iconPath("network-wired-symbolic");
                            }

                            if (Networking.connectivity !== NetworkConnectivity.Full) {
                                return Quickshell.iconPath("network-wireless-no-route-symbolic");
                            }

                            return Quickshell.iconPath("network-wired-disconnected-symbolic");
                        }

                        return Quickshell.iconPath("dialog-warning-symbolic");
                    }

                    color: Colors.text
                }
            }
        }

        WrapperMouseArea {
            id: time

            hoverEnabled: true
            propagateComposedEvents: true

            onPressed: mouse => mouse.accepted = false

            BarRevealerText {
                text: Qt.formatDateTime(clock.date, "dddd, dd MMM yyyy")
                reveal: time.containsMouse
                spacingText: 10

                BarText {
                    text: Qt.formatDateTime(clock.date, "hh:mm")
                }
            }

            SystemClock {
                id: clock
                precision: SystemClock.Minutes
            }
        }
    }

    Process {
        id: agsProc
        command: ["ags", "request", "window glance"]
    }
}
