import QtQuick
import QtQuick.Layouts
import QtQuick.Controls.impl 2.15

import Quickshell
import Quickshell.Widgets

import Colors

RowLayout {
    id: root

    property string source
    property color sourceColor: Colors.accent

    property string text

    readonly property Region region: Region {
        item: maskItem
    }

    signal clicked(event: MouseEvent)

    Layout.alignment: Qt.AlignRight
    spacing: 30

    Text {
        id: label
        text: root.text
        color: Colors.accent
        opacity: 0

        font {
            pixelSize: 18
            bold: true
        }

        states: [
            State {
                name: "showing"
                when: mouseArea.containsMouse
                PropertyChanges {
                    label.opacity: 1
                    label.rightPadding: 0
                }
            },
            State {
                name: "hiding"
                when: !mouseArea.containsMouse
                PropertyChanges {
                    label.opacity: 0
                    label.rightPadding: -100
                }
            }
        ]

        transitions: [
            Transition {
                from: "*"
                to: "hiding"

                SequentialAnimation {
                    NumberAnimation {
                        target: label
                        property: "opacity"
                        duration: 200
                    }

                    NumberAnimation {
                        target: label
                        property: "rightPadding"
                        duration: 0
                    }
                }
            },
            Transition {
                from: "*"
                to: "showing"

                ParallelAnimation {
                    NumberAnimation {
                        target: label
                        property: "opacity"
                        duration: 200
                    }

                    NumberAnimation {
                        target: label
                        property: "rightPadding"
                        duration: 200
                        easing.type: Easing.OutBack
                    }
                }
            }
        ]
    }

    WrapperRectangle {
        id: maskItem

        implicitWidth: 130
        implicitHeight: mouseArea.containsMouse ? implicitWidth : implicitWidth + 20
        radius: 10

        color: mouseArea.containsMouse ? Colors.secondary : Colors.primary

        Behavior on implicitHeight {
            NumberAnimation {
                duration: 200
                easing.type: Easing.OutCubic
            }
        }

        Behavior on color {
            ColorAnimation {
                duration: 100
            }
        }

        MouseArea {
            id: mouseArea

            hoverEnabled: true

            onClicked: event => root.clicked(event)

            // https://stackoverflow.com/questions/69964071/qt-qml-colorimage-is-not-a-type
            ColorImage {
                source: root.source

                anchors.centerIn: parent

                width: 50
                height: 50

                color: root.sourceColor
            }
        }
    }
}
