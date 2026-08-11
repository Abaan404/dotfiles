pragma Singleton

import QtQuick
import Quickshell
import Quickshell.Bluetooth

Singleton {
    id: root

    readonly property BluetoothDevice connected: Bluetooth.devices.values.find(dev => dev.connected) ?? null // qmllint disable unresolved-type
    readonly property BluetoothDevice pairing: Bluetooth.devices.values.find(dev => dev.pairing) ?? null // qmllint disable unresolved-type

    function iconName(device: BluetoothDevice): string {
        if (!device || !device.connected) {
            return "network-bluetooth-inactive";
        }

        return "network-bluetooth-activated";
    }
}
