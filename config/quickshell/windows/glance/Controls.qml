pragma ComponentBehavior: Bound

import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import QtQuick.Controls.impl 2.15

import Quickshell
import Quickshell.Widgets
import Quickshell.Networking
import Quickshell.Services.UPower

import Colors
import Utils

WrapperRectangle {
    id: controls

    property int selectedIdx: 0
    property Region region: Region {
        item: controls
        radius: 20
    }

    margin: 20
    radius: 20

    color: Colors.colors_color1

    resizeChild: false

    component ControlButton: WrapperMouseArea {
        id: controlButton

        required property string source
        required property int idx
        property int sourceSize: 20
        property double value: 0

        hoverEnabled: true

        onClicked: controls.selectedIdx = idx

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

            idx: 0
            sourceSize: 20
            value: NetworkingHelper.wifiNetwork?.signalStrength ?? NetworkingHelper.wired?.state == ConnectionState.Connected
            source: Quickshell.iconPath(NetworkingHelper.defaultIconName)
        }

        ControlButton {
            id: bluetooth

            idx: 1
            sourceSize: 26
            value: BluetoothHelper.connected?.batteryAvailable ? BluetoothHelper.connected?.battery : 0

            source: Quickshell.iconPath(BluetoothHelper.iconName(BluetoothHelper.connected))
        }

        ControlButton {
            id: battery

            readonly property UPowerDevice device: UPower.devices.values.find(dev => dev.isLaptopBattery) ?? null
            readonly property real percentage: battery?.device?.percentage ?? 0

            idx: 2
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

            idx: 3
            sourceSize: 20

            source: Quickshell.iconPath("timer-symbolic")
        }
    }
}
