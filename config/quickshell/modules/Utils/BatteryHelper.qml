pragma Singleton

import QtQuick
import Quickshell
import Quickshell.Services.UPower

Singleton {
    id: root

    readonly property UPowerDevice device: UPower.devices.values.find(dev => dev.isLaptopBattery) ?? null
    readonly property real percentage: root?.device?.percentage ?? 0

    readonly property string iconName: {
        if (!device) {
            return "battery-full";
        }

        // qmlformat off
        let icon = StringsHelper.symbolicStrength(root.percentage, [
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

        return icon;
    }
}
