pragma ComponentBehavior: Bound

import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import QtQuick.Controls.impl 2.15

import Quickshell
import Quickshell.Widgets
import Quickshell.Networking
import Quickshell.Bluetooth
import Quickshell.Services.UPower

import Colors
import Utils

WrapperRectangle {
    id: controls

    property string selectedName: "time"
    property Region region: Region {
        item: controls
        radius: 20
    }

    margin: 20
    radius: 20

    color: Colors.colors_color1

    onSelectedNameChanged: console.log(selectedName)

    resizeChild: false

    component ControlButton: WrapperMouseArea {
        id: controlButton

        required property string source
        required property string name
        property int sourceSize: 20
        property double value: 0

        hoverEnabled: true

        onClicked: controls.selectedName = name

        ProgressBar {
            id: control

            rotation: -90

            value: controlButton.value

            anchors.fill: parent
            contentItem: Item {}

            background: Rectangle {
                color: ColorHelper.mouse(Colors.primary, controlButton.containsMouse, controlButton.containsPress)
                radius: 10

                implicitWidth: 65
                implicitHeight: 65

                Behavior on color {
                    ColorAnimation {
                        property: "color"
                        duration: 200
                    }
                }

                Rectangle {
                    height: parent.height
                    width: control.visualPosition * parent.width
                    color: ColorHelper.mouse(Colors.secondary, controlButton.containsMouse, controlButton.containsPress)

                    radius: 10

                    Behavior on color {
                        ColorAnimation {
                            property: "color"
                            duration: 200
                        }
                    }
                }

                ColorImage {
                    sourceSize {
                        width: controlButton.sourceSize
                        height: controlButton.sourceSize
                    }

                    source: controlButton.source

                    rotation: 90

                    anchors.centerIn: parent
                    color: Colors.text
                }
            }
        }
    }

    ColumnLayout {
        spacing: 20

        ControlButton {
            id: internet

            readonly property WifiDevice wifi: Networking.devices.values.find(dev => dev.type === DeviceType.Wifi && dev.connected) ?? null
            readonly property WiredDevice wired: Networking.devices.values.find(dev => dev.type === DeviceType.Wired && dev.connected) ?? null

            readonly property WifiNetwork wifiNetwork: wifi?.networks.values.find(n => n.connected) ?? null

            readonly property Network wiredNetwork: wired?.network ?? null // qmllint disable unresolved-type

            name: "internet"
            sourceSize: 20
            value: internet.wifiNetwork?.signalStrength ?? internet.wired.state == ConnectionState.Connected

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
                            return Quickshell.iconPath("network-wireless-signal-none-symbolic");
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
        }

        ControlButton {
            id: bluetooth

            readonly property BluetoothDevice device: Bluetooth.devices.values.find(dev => dev.connected) ?? null // qmllint disable unresolved-type

            name: "bluetooth"
            sourceSize: 26
            value: device.batteryAvailable ? device.battery : 0

            source: {
                if (!device) {
                    return Quickshell.iconPath("network-bluetooth-inactive");
                }

                return Quickshell.iconPath("network-bluetooth-activated");
            }
        }

        ControlButton {
            id: battery

            readonly property UPowerDevice device: UPower.devices.values.find(dev => dev.isLaptopBattery) ?? null
            readonly property real percentage: battery?.device?.percentage ?? 0

            name: "battery"
            sourceSize: 26
            value: percentage

            source: {
                if (!device) {
                    return Quickshell.iconPath("battery-full");
                }
                // qmlformat off
                let icon = StringsHelper.symbolicStrength(battery.percentage, [
                    "battery-000",
                    "battery-020",
                    "battery-040",
                    "battery-060",
                    "battery-080",
                    "battery-100",
                ], 1);
                // qmlformat on

                if (device.powerSupply) {
                    icon += "-charging";
                }

                return Quickshell.iconPath(icon);
            }
        }

        ControlButton {
            id: time

            SystemClock {
                id: clock
                precision: SystemClock.Minutes
            }

            readonly property UPowerDevice device: UPower.devices.values.find(dev => dev.isLaptopBattery) ?? null
            readonly property real percentage: battery?.device?.percentage ?? 0
            value: parseInt(Qt.formatDateTime(clock.date, "H")) / 24 + parseInt(Qt.formatDateTime(clock.date, "m")) / (24 * 60)

            name: "time"
            sourceSize: 20

            source: Quickshell.iconPath("timer-symbolic")
        }
    }
}
