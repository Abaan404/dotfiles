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
    id: root

    color: Colors.colors_color1
    radius: 20
    margin: 14

    component Button: WrapperMouseArea {
        id: button

        property alias childRect: rect.child
        property color background: Colors.primary
        property int rectMargin: 8
        property int rectSideMargin: rectMargin

        hoverEnabled: true

        WrapperRectangle {
            id: rect

            radius: 10
            margin: button.rectMargin
            leftMargin: button.rectSideMargin
            rightMargin: button.rectSideMargin

            color: ColorHelper.mouse(button.background, button.containsMouse, button.containsPress)

            Behavior on color {
                ColorAnimation {
                    duration: 400
                    easing.type: Easing.OutExpo
                }
            }
        }
    }

    component NetworkButton: Button {
        id: networkButton

        visible: network !== null

        property WifiNetwork network: null
        property bool showPasswordInput: false

        background: network?.connected ? Colors.good : Colors.primary
        rectSideMargin: 14
        rectMargin: 12

        childRect: ColumnLayout {
            spacing: 10

            RowLayout {
                spacing: 18

                ColorImage {
                    sourceSize {
                        width: 26
                        height: 26
                    }

                    source: Quickshell.iconPath(NetworkingHelper.iconNameWifi(networkButton.network))
                    color: Colors.text
                }

                Text {
                    Layout.fillWidth: true

                    text: networkButton.network?.name ?? "Unknown"
                    color: Colors.text
                    elide: Text.ElideRight

                    font {
                        pixelSize: 20
                        weight: Font.Bold
                    }
                }
            }

            RowLayout {
                spacing: 10
                visible: networkButton.showPasswordInput

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

                        onAccepted: networkButton.network?.connectWithPsk(text)

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

                    onClicked: networkButton.network?.connectWithPsk(input.text)

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
    }

    ColumnLayout {
        spacing: 8

        RowLayout {
            spacing: 8

            Button {
                id: search

                background: NetworkingHelper.wifi?.scannerEnabled && Networking.wifiEnabled ? Colors.good : Colors.primary
                onClicked: NetworkingHelper.wifi.scannerEnabled = !NetworkingHelper.wifi.scannerEnabled

                childRect: ColorImage {
                    sourceSize {
                        width: 24
                        height: 24
                    }

                    source: Quickshell.iconPath("search")
                    color: Colors.text
                }
            }

            Button {
                id: flightMode

                background: Networking.wifiEnabled ? Colors.primary : Colors.warning
                onClicked: Networking.wifiEnabled = !Networking.wifiEnabled

                childRect: ColorImage {
                    sourceSize {
                        width: 24
                        height: 24
                    }

                    source: Quickshell.iconPath("airplane-mode")
                    color: Colors.text
                }
            }

            Button {
                id: current

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

                childRect: RowLayout {
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

        NetworkButton {
            id: selected

            property string name: ""

            Layout.fillWidth: true
            network: NetworkingHelper.wifi?.networks.values.find(n => n.name === name) ?? null

            showPasswordInput: true
        }

        ScrollView {
            Layout.fillWidth: true
            Layout.fillHeight: true

            clip: true

            ListView {
                id: view

                spacing: 10

                add: Transition {
                    NumberAnimation {
                        properties: "opacity"
                        from: 0
                        to: 1
                        duration: 200
                        easing.type: Easing.OutExpo
                    }
                    NumberAnimation {
                        properties: "x"
                        from: -view.width
                        duration: 200
                        easing.type: Easing.OutExpo
                    }
                }

                remove: Transition {
                    NumberAnimation {
                        properties: "opacity"
                        to: 0
                        duration: 150
                        easing.type: Easing.InExpo
                    }
                    NumberAnimation {
                        properties: "x"
                        to: view.width
                        duration: 150
                        easing.type: Easing.InExpo
                    }
                }

                move: Transition {
                    NumberAnimation {
                        properties: "x,y"
                        duration: 200
                        easing.type: Easing.OutExpo
                    }
                }

                displaced: Transition {
                    NumberAnimation {
                        properties: "x,y"
                        duration: 200
                        easing.type: Easing.OutExpo
                    }
                }

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

                delegate: NetworkButton {
                    id: item

                    required property var modelData

                    network: modelData
                    implicitWidth: ListView.view.width

                    onClicked: network.connect()

                    Connections {
                        target: item.network

                        function onConnectionFailed(reason) {
                            if (reason === ConnectionFailReason.NoSecrets) {
                                selected.name = item.network.name;
                            }
                        }
                    }
                }

                ScrollIndicator.vertical: ScrollIndicator {}
            }
        }
    }
}
