pragma ComponentBehavior: Bound

import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import QtQuick.Controls.impl 2.15

import Quickshell
import Quickshell.Widgets
import Quickshell.Services.Pipewire

import Colors
import Utils

ColumnLayout {
    id: root

    QtObject {
        id: internal

        property bool showExtra: false
    }

    required property PwNode node
    property ScriptModel extraNodes

    signal clickedNode(node: var)

    spacing: 0

    component CustomButton: WrapperMouseArea {
        id: button

        default property Item item
        property color color: Colors.primary

        hoverEnabled: true

        WrapperRectangle {
            margin: 5
            leftMargin: 10
            rightMargin: 10

            radius: 10
            color: ColorHelper.mouse(button.color, button.containsMouse, button.containsPress)
            child: button.item

            Behavior on color {
                ColorAnimation {
                    duration: 200
                }
            }
        }
    }

    component EndpointButton: CustomButton {
        id: button

        required property PwNode node

        RowLayout {
            spacing: 10

            ColorImage {
                source: {
                    if (button.node.isStream) {
                        return Quickshell.iconPath("media-optical-cd-audio-symbolic");
                    }

                    if (button.node.name.startsWith("bluez_output")) {
                        return Quickshell.iconPath("audio-headphones-symbolic");
                    }

                    if (button.node.isSink) {
                        if (button.node.audio.muted || button.node.audio.volume <= 0) {
                            return Quickshell.iconPath("audio-volume-muted-symbolic");
                        }
                        // qmlformat off
                        const icon = StringsHelper.symbolicStrength(button.node.audio.volume , [
                            Quickshell.iconPath("audio-volume-low-symbolic"),
                            Quickshell.iconPath("audio-volume-medium-symbolic"),
                            Quickshell.iconPath("audio-volume-high-symbolic"),
                        ], 1);
                        // qmlformat on

                        return icon;
                    } else {
                        if (button.node.audio.muted || (button.node.audio.volume) <= 0) {
                            return Quickshell.iconPath("audio-input-microphone-muted-symbolic");
                        }
                        // qmlformat off
                        const icon = StringsHelper.symbolicStrength(button.node.audio.volume, [
                            Quickshell.iconPath("audio-input-microphone-low-symbolic"),
                            Quickshell.iconPath("audio-input-microphone-medium-symbolic"),
                            Quickshell.iconPath("audio-input-microphone-high-symbolic"),
                        ], 1);
                        // qmlformat on

                        return icon;
                    }
                }

                sourceSize {
                    width: 16
                    height: 16
                }

                color: Colors.text
            }

            Text {
                text: {
                    if (button.node.isStream) {
                        return StringsHelper.truncate(button.node.properties["media.name"], 40);
                    }

                    return StringsHelper.truncate(button.node.description, 40);
                }

                color: Colors.text

                font {
                    pixelSize: 14
                    weight: Font.ExtraBold
                }
            }
        }
    }

    WrapperItem {
        Layout.fillWidth: true

        bottomMargin: 10

        RowLayout {
            spacing: 10

            Layout.alignment: Qt.AlignRight

            EndpointButton {
                node: root.node
                onClicked: internal.showExtra = !internal.showExtra
            }

            // just a spacer
            Item {
                Layout.fillWidth: true
            }

            CustomButton {
                color: root.node.audio.muted || root.node.audio.volume <= 0 ? Colors.bad : Colors.primary
                onClicked: root.node.audio.muted = !root.node.audio.muted

                Layout.alignment: Qt.AlignRight

                Text {
                    text: `${Math.ceil(root.node.audio.volume * 100)}%`

                    color: Colors.text

                    font {
                        pixelSize: 14
                        weight: Font.ExtraBold
                    }
                }
            }
        }
    }

    WrapperItem {
        clip: true

        implicitHeight: internal.showExtra && root.extraNodes.values.length > 0 ? child.implicitHeight : 0

        Behavior on implicitHeight {
            NumberAnimation {
                duration: 300
                easing.type: Easing.OutCubic
            }
        }

        WrapperItem {
            bottomMargin: 10

            ColumnLayout {
                spacing: 10

                Repeater {
                    model: root.extraNodes

                    delegate: EndpointButton {
                        required property var modelData

                        property bool selected: false

                        node: modelData.node
                        color: modelData.highlight

                        onClicked: root.clickedNode(modelData.node)
                    }
                }
            }
        }
    }

    Slider {
        id: control
        implicitHeight: 10

        Layout.fillWidth: true

        handle: Item {}

        background: Rectangle {
            radius: 10
            color: Colors.secondary

            Rectangle {
                width: control.visualPosition * parent.width
                height: parent.height
                color: Colors.accent
                radius: 10
            }
        }

        onMoved: root.node.audio.volume = value
        value: root.node.audio.volume
    }
}
