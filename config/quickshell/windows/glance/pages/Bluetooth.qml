import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QtQuick.Controls.impl 2.15

import Quickshell
import Quickshell.Bluetooth
import Quickshell.Widgets

import Colors
import Utils

WrapperRectangle {
    id: root

    color: Colors.colors_color1
    radius: 20
    margin: 14

    component DeviceEntry: PageEntry {
        id: entry

        required property BluetoothDevice device

        background: {
            if (entry.device?.connected) {
                return Colors.good;
            } else if (entry.device?.pairing) {
                return Colors.warning;
            }

            return Colors.primary;
        }

        source: Quickshell.iconPath(BluetoothHelper.iconName(entry.device))
        text: entry.device?.name ?? "Unknown"

        onClicked: {
            if (entry.device?.pairing) {
                entry.device?.cancelPair();
                return;
            }

            if (entry.device?.connected) {
                entry.device?.disconnect();
                return;
            }

            if (entry.device?.paired || entry.device.trusted) {
                entry.device?.connect();
                return;
            }

            // need an agent to pair
            // https://github.com/quickshell-mirror/quickshell/pull/138
            entry.device?.pair();
        }
    }

    ColumnLayout {
        spacing: 8

        RowLayout {
            PageButton {
                background: Bluetooth.defaultAdapter?.discovering ? Colors.good : Colors.primary // qmllint disable unresolved-type
                onClicked: Bluetooth.defaultAdapter.discovering = !Bluetooth.defaultAdapter.discovering // qmllint disable unresolved-type

                ColorImage {
                    sourceSize {
                        width: 24
                        height: 24
                    }

                    source: Quickshell.iconPath("search")
                    color: Colors.text
                }
            }

            PageButton {
                background: Bluetooth.defaultAdapter?.discoverable ? Colors.good : Colors.primary // qmllint disable unresolved-type
                onClicked: Bluetooth.defaultAdapter.discoverable = !Bluetooth.defaultAdapter.discoverable // qmllint disable unresolved-type

                ColorImage {
                    sourceSize {
                        width: 24
                        height: 24
                    }

                    source: Quickshell.iconPath(Bluetooth.defaultAdapter?.discoverable ? "network-bluetooth-activated" : "network-bluetooth-inactive") // qmllint disable unresolved-type
                    color: Colors.text
                }
            }

            PageButton {
                Layout.fillWidth: true

                rectSideMargin: 16

                background: {
                    if (BluetoothHelper.connected) {
                        return Colors.good;
                    }

                    if (BluetoothHelper.pairing) {
                        return Colors.warning;
                    }

                    if (!Bluetooth.defaultAdapter?.enabled) { // qmllint disable unresolved-type
                        return Colors.bad;
                    }

                    return Colors.primary;
                }

                onClicked: Bluetooth.defaultAdapter.enabled = !Bluetooth.defaultAdapter?.enabled // qmllint disable unresolved-type

                RowLayout {
                    spacing: 14

                    ColorImage {
                        sourceSize {
                            width: 20
                            height: 20
                        }

                        source: Quickshell.iconPath(BluetoothHelper.iconName(BluetoothHelper.connected))
                        color: Colors.text
                    }

                    Text {
                        Layout.fillWidth: true

                        text: {
                            if (!Bluetooth.defaultAdapter?.enabled) { // qmllint disable unresolved-type
                                return "Disabled";
                            }

                            return BluetoothHelper.connected?.name ?? "Disconnected";
                        }

                        color: Colors.text
                        elide: Text.ElideRight

                        font {
                            pixelSize: 17
                            weight: Font.Bold
                        }
                    }
                }
            }
        }

        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: 5

            radius: 100
            color: Colors.accent
        }

        ScrollView {
            Layout.fillWidth: true
            Layout.fillHeight: true

            clip: true

            PageView {
                model: Bluetooth.devices // qmllint disable unresolved-type

                delegate: WrapperItem {
                    id: item

                    required property var modelData

                    implicitWidth: ListView.view.width

                    Connections {
                        target: item.modelData

                        function onPairedChanged() {
                            if (item.modelData.device.paired) {
                                item.modelData.device.connect();
                            }
                        }
                    }

                    DeviceEntry {
                        device: item.modelData
                    }
                }
            }
        }
    }
}
