pragma ComponentBehavior: Bound

import QtQuick
import QtQuick.Layouts

import Quickshell.Widgets
import Quickshell.Hyprland

import Colors

import ".."

BarItem {
    id: root

    readonly property list<string> glyphs: ["", "", "", ""]
    readonly property string extraGlyph: ""

    readonly property list<HyprlandWorkspace> workspaces: {
        return Hyprland.workspaces.values.filter(ws => ws.id > 0);
    }

    hoverEnabled: false

    RowLayout {
        spacing: 25

        Repeater {
            model: root.workspaces

            delegate: WrapperRectangle {
                id: workspace

                required property HyprlandWorkspace modelData

                Layout.alignment: Qt.AlignCenter
                color: "transparent"

                WrapperMouseArea {
                    id: mouseArea

                    anchors.fill: parent
                    hoverEnabled: true
                    onClicked: workspace.modelData.activate()

                    BarText {
                        id: text

                        text: root.glyphs[workspace.modelData?.id - 1] ?? root.extraGlyph
                        color: workspace.modelData.active || mouseArea.containsMouse ? "white" : Colors.text

                        Behavior on color {
                            ColorAnimation {
                                target: text
                                property: "color"
                                duration: 100
                            }
                        }
                    }
                }
            }
        }
    }
}
