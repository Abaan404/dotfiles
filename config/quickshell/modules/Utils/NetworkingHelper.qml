pragma Singleton

import Quickshell
import Quickshell.Networking

Singleton {
    id: root

    readonly property WifiDevice wifi: Networking.devices.values.find(dev => dev.type === DeviceType.Wifi) ?? null
    readonly property WiredDevice wired: Networking.devices.values.find(dev => dev.type === DeviceType.Wired) ?? null

    readonly property WifiNetwork wifiNetwork: wifi?.networks.values.find(n => ![ConnectionState.Disconnected, ConnectionState.Unknown].includes(n.state)) ?? null

    readonly property Network wiredNetwork: wired?.network ?? null // qmllint disable unresolved-type

    readonly property string defaultIconName: {
        if (wifiNetwork) {
            return iconNameWifi(wifiNetwork);
        } else if (wiredNetwork) {
            return iconNameWired(wiredNetwork);
        } else {
            return "network-wireless-disconnected";
        }
    }

    function isSecureWifi(network: WifiNetwork): bool {
        const pskSecurityTypes = [WifiSecurityType.WpaPsk, WifiSecurityType.Wpa2Psk, WifiSecurityType.Sae];
        return pskSecurityTypes.includes(network.security); // qmllint disable unresolved-type
    }

    function iconNameWifi(network: WifiNetwork): string {
        if (!wifi || !network) {
            return "dialog-warning-symbolic";
        }

        let prefix = "network-wireless";

        if (!network.connected && isSecureWifi(network)) { // qmllint disable unresolved-type
            prefix = "network-wireless-secure";
        }

        // qmlformat off
        const strengthIcons = [
            `${prefix}-signal-none-symbolic`,
            `${prefix}-signal-low-symbolic`,
            `${prefix}-signal-ok-symbolic`,
            `${prefix}-signal-good-symbolic`,
            `${prefix}-signal-excellent-symbolic`,
        ];
        // qmlformat on

        if (!network.connected) {
            return StringsHelper.symbolicStrength(network.signalStrength, strengthIcons, 1);
        }

        if (wifi.state === ConnectionState.Connecting) {
            return "network-wireless-acquiring-symbolic";
        }

        if (wifi.mode === WifiDeviceMode.AccessPoint) { // qmllint disable unresolved-type
            return "network-wireless-hotspot-symbolic";
        }

        if (wifi.state === ConnectionState.Connected) {
            if (Networking.connectivity !== NetworkConnectivity.Full) {
                return "network-wireless-no-route-symbolic";
            }

            return StringsHelper.symbolicStrength(network.signalStrength, strengthIcons, 1);
        }

        return "network-wireless-offline-symbolic";
    }

    function iconNameWired(network: Network): string {
        if (!wired || !network) {
            return "dialog-warning-symbolic";
        }

        if (wired.state === ConnectionState.Connected) {
            if (Networking.connectivity !== NetworkConnectivity.Full) {
                return "network-wired-no-route-symbolic";
            }

            return "network-wired-symbolic";
        }

        if (wired.state === ConnectionState.Connecting) {
            return "network-wired-acquiring-symbolic";
        }

        return "network-wired-disconnected-symbolic";
    }
}
