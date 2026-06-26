import QtQuick
import QtQuick.Layouts

import Quickshell.Io
import Quickshell.Widgets
import Quickshell.Services.Pipewire

import Colors
import Utils

import qs.windows.bar

Loader {
    visible: Pipewire.ready
    active: Pipewire.ready

    sourceComponent: BarItem {
        onClicked: agsProc.running = true

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

        Process {
            id: agsProc
            command: ["ags", "request", "window media"]
        }
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
            spacing: 7

            BarText {
                text: endpoint.glyph
            }

            BarText {
                visible: !endpoint.node?.audio?.muted ?? false
                text: `${Math.ceil((endpoint.node?.audio?.volume ?? 0) * 100)}%`
            }
        }
    }
}
