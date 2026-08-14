import QtQuick
import QtQuick.Layouts
import QtQuick.Controls.impl 2.15

import Quickshell
import Quickshell.Widgets
import Quickshell.Services.Pipewire

import Services
import Colors
import Utils

import qs.windows.bar

BarItem {
    onClicked: WindowState.toggle("media")

    background: {
        const node = Pipewire.defaultAudioSink;
        if (!node) {
            return Colors.primary;
        }

        if (node.audio?.muted) {
            return Colors.bad;
        }

        if (node.name.startsWith("bluez_output")) {
            return Colors.bluetooth;
        }

        return Colors.primary;
    }

    RowLayout {
        spacing: 10

        EndpointWidget {
            visible: Pipewire.defaultAudioSink !== null
            node: Pipewire.defaultAudioSink
            glyph: {
                const node = Pipewire.defaultAudioSink;
                if (!node) {
                    return "󰝟 ";
                }

                if (node.name.startsWith("bluez_output")) {
                    return " ";
                }

                if (node.audio?.muted || (node.audio?.volume ?? 0) <= 0) {
                    return "󰝟 ";
                }

                return StringsHelper.symbolicStrength(node.audio?.volume ?? 0, ["󰖀 ", "󰕾 "], 1);
            }
        }

        EndpointWidget {
            visible: Pipewire.defaultAudioSource !== null
            node: Pipewire.defaultAudioSource
            glyph: {
                const node = Pipewire.defaultAudioSource;
                if (!node) {
                    return "";
                }

                return node.audio?.muted ? "" : "";
            }
        }
    }

    PwObjectTracker {
        objects: [Pipewire.defaultAudioSink, Pipewire.defaultAudioSource]
    }

    component EndpointWidget: WrapperMouseArea {
        id: endpoint

        required property PwNode node
        required property string glyph

        acceptedButtons: Qt.MiddleButton

        onClicked: {
            if (!node?.audio) {
                return;
            }

            node.audio.muted = !node.audio.muted;
        }

        onWheel: event => {
            if (!node?.audio) {
                return;
            }

            const volume = node.audio.volume + event.angleDelta.y / 1000;
            node.audio.volume = Math.min(Math.max(volume, 0), 1);
        }

        RowLayout {
            spacing: 8

            ColorImage {
                source: {
                    if (!endpoint.node) {
                        return Quickshell.iconPath("dialog-warning");
                    }

                    if (endpoint.node.isStream) {
                        return Quickshell.iconPath("media-optical-cd-audio-symbolic");
                    }

                    if (endpoint.node.name.startsWith("bluez_output")) {
                        return Quickshell.iconPath("audio-headphones-symbolic");
                    }

                    if (endpoint.node.isSink) {
                        if (endpoint.node.audio.muted || endpoint.node.audio.volume <= 0) {
                            return Quickshell.iconPath("audio-volume-muted-symbolic");
                        }
                        // qmlformat off
                        const icon = StringsHelper.symbolicStrength(endpoint.node.audio.volume , [
                            Quickshell.iconPath("audio-volume-low-symbolic"),
                            Quickshell.iconPath("audio-volume-medium-symbolic"),
                            Quickshell.iconPath("audio-volume-high-symbolic"),
                        ], 1);
                        // qmlformat on

                        return icon;
                    } else {
                        if (endpoint.node.audio.muted || (endpoint.node.audio.volume) <= 0) {
                            return Quickshell.iconPath("audio-input-microphone-muted-symbolic");
                        }
                        // qmlformat off
                        const icon = StringsHelper.symbolicStrength(endpoint.node.audio.volume, [
                            Quickshell.iconPath("audio-input-microphone-low-symbolic"),
                            Quickshell.iconPath("audio-input-microphone-medium-symbolic"),
                            Quickshell.iconPath("audio-input-microphone-high-symbolic"),
                        ], 1);
                        // qmlformat on

                        return icon;
                    }
                }

                sourceSize {
                    width: 14
                    height: 14
                }

                color: Colors.text
            }

            BarText {
                visible: !endpoint.node?.audio?.muted ?? false
                text: `${Math.ceil((endpoint.node?.audio?.volume ?? 0) * 100)}%`
            }
        }
    }
}
