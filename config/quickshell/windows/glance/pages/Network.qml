pragma ComponentBehavior: Bound

import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QtQuick.Controls.impl 2.15

import Quickshell
import Quickshell.Networking
import Quickshell.Widgets

import Colors
import Utils

WrapperRectangle {
    color: Colors.colors_color1
    radius: 20
    margin: 14

    component NetworkEntry: PageEntry {
        id: entry

        property WifiNetwork network: null

        visible: network !== null

        background: network?.connected ? Colors.good : Colors.primary
        source: Quickshell.iconPath(NetworkingHelper.iconNameWifi(entry.network))
        text: entry.network?.name ?? "Unknown"

        onClicked: network.connect()
    }

    ColumnLayout {
        spacing: 8

        RowLayout {
            spacing: 8

            PageButton {
                background: NetworkingHelper.wifi?.scannerEnabled && Networking.wifiEnabled ? Colors.good : Colors.primary
                onClicked: NetworkingHelper.wifi.scannerEnabled = !NetworkingHelper.wifi.scannerEnabled

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
                // rfkill here
                background: Networking.wifiEnabled ? Colors.primary : Colors.warning
                onClicked: Networking.wifiEnabled = !Networking.wifiEnabled

                ColorImage {
                    sourceSize {
                        width: 24
                        height: 24
                    }

                    source: Quickshell.iconPath("airplane-mode")
                    color: Colors.text
                }
            }

            PageButton {
                Layout.fillWidth: true

                rectSideMargin: 16

                background: {
                    if (NetworkingHelper.wired?.hasLink) {
                        return Colors.good;
                    }

                    if (NetworkingHelper.wifi?.state === ConnectionState.Connected) {
                        return Colors.good;
                    } else if (NetworkingHelper.wifi?.state === ConnectionState.Connecting) {
                        return Colors.warning;
                    } else if (NetworkingHelper.wifi?.autoconnect === false) {
                        return Colors.bad;
                    }

                    return Colors.primary;
                }

                onClicked: {
                    if (NetworkingHelper.wifiNetwork?.connected) {
                        NetworkingHelper.wifiNetwork.disconnect();
                    } else {
                        NetworkingHelper.wifi.autoconnect = !NetworkingHelper.wifi.autoconnect;
                    }
                }

                RowLayout {
                    spacing: 14

                    ColorImage {
                        sourceSize {
                            width: 20
                            height: 20
                        }

                        source: Quickshell.iconPath(NetworkingHelper.defaultIconName)
                        color: Colors.text
                    }

                    Text {
                        Layout.fillWidth: true

                        text: {
                            if (NetworkingHelper.wired?.hasLink) {
                                return NetworkingHelper.wiredNetwork?.name ?? "Unknown";
                            }

                            if (NetworkingHelper.wifi?.state === ConnectionState.Connected) {
                                return NetworkingHelper.wifiNetwork?.name ?? "Unknown";
                            } else if (NetworkingHelper.wifi?.state === ConnectionState.Connecting) {
                                return "Connecting...";
                            }

                            return "Disconnected";
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

        NetworkEntry {
            id: selected

            property string name: ""

            Layout.fillWidth: true
            network: NetworkingHelper.wifi?.networks.values.find(n => n.name === name) ?? null

            hoverEnabled: false
            onPressed: mouse => mouse.accepted = false

            RowLayout {
                spacing: 10

                WrapperRectangle {
                    Layout.fillWidth: true

                    margin: 5
                    leftMargin: 12
                    rightMargin: 12
                    radius: 10
                    color: Colors.secondary

                    Behavior on color {
                        ColorAnimation {
                            duration: 200
                        }
                    }

                    TextInput {
                        id: input

                        clip: true

                        text: ""
                        color: Colors.text
                        passwordMaskDelay: 10
                        echoMode: TextInput.Password

                        onAccepted: selected.network?.connectWithPsk(text)

                        font {
                            pixelSize: 14
                            weight: Font.ExtraBold
                        }
                    }
                }

                WrapperMouseArea {
                    id: button

                    hoverEnabled: true

                    Layout.preferredHeight: parent.height
                    Layout.preferredWidth: parent.height

                    onClicked: selected.network?.connectWithPsk(input.text)

                    WrapperRectangle {
                        color: ColorHelper.mouseWithColor(Colors.good, Qt.lighter(Colors.good, 0.9), button.containsMouse, button.containsPress)
                        radius: 10

                        Behavior on color {
                            ColorAnimation {
                                duration: 200
                            }
                        }

                        ColorImage {
                            source: Quickshell.iconPath("reply-symbolic")
                            anchors.fill: parent
                            anchors.margins: 8
                            color: Colors.text
                        }
                    }
                }
            }
        }

        ScrollView {
            Layout.fillWidth: true
            Layout.fillHeight: true

            clip: true

            PageView {
                model: ScriptModel {
                    objectProp: "name"
                    values: {
                        const networks = [...(NetworkingHelper.wifi?.networks.values ?? [])];
                        // FIXME sorting causes a crash even after making a copy

                        // qmlformat off
                        const display = networks
                            .filter(n => n.name !== selected.name);
                            // .sort((n1, n2) => n2.signalStrength - n1.signalStrength);
                        // qmlformat on
                        return display;
                    }
                }

                delegate: WrapperItem {
                    id: item

                    required property var modelData

                    implicitWidth: ListView.view.width

                    NetworkEntry {
                        network: item.modelData
                    }

                    Connections {
                        target: item.modelData

                        function onConnectionFailed(reason) {
                            if (reason === ConnectionFailReason.NoSecrets) {
                                selected.name = item.modelData.name;
                            }
                        }
                    }
                }
            }
        }
    }
}
