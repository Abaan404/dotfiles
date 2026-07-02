pragma ComponentBehavior: Bound

import QtQuick
import QtQuick.Layouts

import Quickshell.Widgets
import Quickshell.Hyprland

import Colors

import qs.windows.bar

BarItem {
    id: root

    readonly property list<string> glyphs: ["", "", "", ""]
    readonly property string extraGlyph: ""

    readonly property list<HyprlandWorkspace> workspaces: {
        return Hyprland.workspaces.values.filter(ws => ws.id > 0);
    }

    hoverEnabled: false
    padding: 0

    RowLayout {
        spacing: 0

        Repeater {
            model: root.workspaces

            delegate: WrapperMouseArea {
                id: mouseArea

                required property HyprlandWorkspace modelData
                required property int index

                leftMargin: index === 0 ? 14 : 12.5
                rightMargin: index === root.workspaces.length ? 14 : 12.5
                hoverEnabled: true
                resizeChild: false

                onClicked: modelData.activate()

                Layout.alignment: Qt.AlignCenter
                Layout.fillHeight: true

                BarText {
                    id: text

                    anchors.centerIn: parent
                    text: root.glyphs[mouseArea.modelData?.id - 1] ?? root.extraGlyph
                    color: mouseArea.modelData.active || mouseArea.containsMouse ? "white" : Colors.text

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
