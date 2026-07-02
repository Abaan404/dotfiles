import QtQuick

import Colors

Text {
    id: root

    required property int direction
    property bool revealText

    enum Direction {
        Left = 0,
        Right = 1
    }

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
            when: root.revealText
            PropertyChanges {
                root.opacity: 1
                root.rightPadding: root.direction === MenuText.Direction.Right ? 0 : undefined
                root.leftPadding: root.direction === MenuText.Direction.Left ? 0 : undefined
            }
        },
        State {
            name: "hiding"
            when: !root.revealText
            PropertyChanges {
                root.opacity: 0
                root.rightPadding: root.direction === MenuText.Direction.Right ? -100 : undefined
                root.leftPadding: root.direction === MenuText.Direction.Left ? -100 : undefined
            }
        }
    ]

    transitions: [
        Transition {
            from: "*"
            to: "hiding"

            SequentialAnimation {
                NumberAnimation {
                    target: root
                    property: "opacity"
                    duration: 200
                }

                NumberAnimation {
                    target: root
                    property: {
                        switch (root.direction) {
                        case MenuText.Direction.Right:
                            return "rightPadding";
                        case MenuText.Direction.Left:
                            return "leftPadding";
                        }
                    }
                    duration: 0
                }
            }
        },
        Transition {
            from: "*"
            to: "showing"

            ParallelAnimation {
                NumberAnimation {
                    target: root
                    property: "opacity"
                    duration: 200
                }

                NumberAnimation {
                    target: root
                    property: {
                        switch (root.direction) {
                        case MenuText.Direction.Right:
                            return "rightPadding";
                        case MenuText.Direction.Left:
                            return "leftPadding";
                        }
                    }
                    duration: 200
                    easing.type: Easing.OutBack
                }
            }
        }
    ]
}
