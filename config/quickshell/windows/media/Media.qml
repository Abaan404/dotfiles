import QtQuick
import QtQuick.Layouts

import Quickshell
import Quickshell.Widgets
import Quickshell.Services.Pipewire

import Services
import qs.windows

import Colors
import Utils

PanelWindow { // qmllint disable uncreatable-type
    implicitWidth: 500
    color: "transparent"

    visible: false
    exclusionMode: ExclusionMode.Ignore
    mask: widget.region

    QtObject {
        id: internal

        property bool showApplications: false
    }

    anchors {
        top: true
        bottom: true
        right: true
    }

    margins { // qmllint disable unqualified unresolved-type
        top: 50 // qmllint disable missing-property
        right: 10 // qmllint disable missing-property
    }

    Component.onCompleted: {
        WindowState.register("media", this);
    }

    WrapperItem {
        y: parent.visible ? 0 : -50

        onYChanged: widget.region.changed()

        Behavior on y {
            NumberAnimation {
                duration: 400
                easing.type: Easing.OutBack
            }
        }

        anchors {
            right: parent.right
            left: parent.left
        }

        WrapperRectangle {
            id: widget

            property Region region: Region {
                item: widget
            }

            margin: 20
            radius: 10
            color: Colors.colors_color1

            ColumnLayout {
                spacing: 0

                WrapperItem {
                    Layout.fillWidth: true
                    bottomMargin: 15

                    Endpoint {
                        node: Pipewire.defaultAudioSink
                        extraNodes: ScriptModel {
                            // qmlformat off
                            values: Pipewire.nodes.values
                                .filter(node => node !== Pipewire.defaultAudioSink && node.isSink && !node.isStream && node.audio)
                                .map(node => ({
                                    node: node,
                                    highlight: Colors.primary,
                                }))
                            // qmlformat on
                        }

                        onClickedNode: node => Pipewire.preferredDefaultAudioSink = node
                    }
                }

                WrapperItem {
                    Layout.fillWidth: true
                    bottomMargin: 15

                    Endpoint {
                        node: Pipewire.defaultAudioSource
                        extraNodes: ScriptModel {
                            // qmlformat off
                            values: Pipewire.nodes.values
                                .filter(node => node !== Pipewire.defaultAudioSource && !node.isSink && !node.isStream && node.audio)
                                .map(node => ({
                                    node: node,
                                    highlight: Colors.primary,
                                }))
                            // qmlformat on
                        }

                        onClickedNode: node => Pipewire.preferredDefaultAudioSource = node
                    }
                }

                WrapperMouseArea {
                    id: button

                    property color color: ColorHelper.mouse(Colors.primary, button.containsMouse, button.containsPress)

                    hoverEnabled: true
                    Layout.fillWidth: true

                    onClicked: internal.showApplications = !internal.showApplications

                    WrapperRectangle {
                        margin: 10

                        radius: height / 2
                        color: button.color

                        resizeChild: false

                        Behavior on color {
                            ColorAnimation {
                                duration: 200
                            }
                        }

                        Text {
                            text: "Applications"
                            color: Colors.text

                            font {
                                pixelSize: 16
                                weight: Font.ExtraBold
                            }
                        }
                    }
                }

                WrapperItem {
                    clip: true
                    implicitHeight: internal.showApplications ? child.implicitHeight : 0

                    Layout.fillWidth: true

                    Behavior on implicitHeight {
                        NumberAnimation {
                            duration: 300
                            easing.type: Easing.OutCubic
                        }
                    }

                    WrapperItem {
                        topMargin: 15

                        ColumnLayout {
                            spacing: 15

                            Repeater {
                                model: ScriptModel {
                                    values: Pipewire.nodes.values.filter(node => node.isStream)
                                }

                                delegate: Endpoint {
                                    id: streamEndpoint

                                    required property PwNode modelData
                                    node: modelData

                                    extraNodes: ScriptModel {
                                        values: {
                                            // qmlformat off
                                            const linkIds = Pipewire.links.values
                                                .filter(link => link.source.id === streamEndpoint.node.id)
                                                .map(link => link.target.id);
                                            // qmlformat on

                                            // qmlformat off
                                            const ret = Pipewire.nodes.values
                                                .filter(node => node.isSink && !node.isStream && node.audio)
                                                .map(node => ({
                                                    node: node,
                                                    highlight: linkIds.includes(node.id) ? Colors.good : Colors.primary,
                                                }));
                                            // qmlformat on

                                            return ret;
                                        }
                                    }

                                    onClickedNode: output => {
                                        const disconnect = Boolean(Pipewire.links.values.find(link => link.source.id === streamEndpoint.node.id));

                                        if (disconnect) {
                                            Quickshell.execDetached(["pw-link", "--disconnect", node.id, output.id]);
                                        } else {
                                            Quickshell.execDetached(["pw-link", node.id, output.id]);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        PwObjectTracker {
            objects: [...Pipewire.nodes.values.filter(node => node.isStream)]
        }
    }

    WindowIpc {
        target: "media"
    }
}
