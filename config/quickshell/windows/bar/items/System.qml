import QtQuick
import QtQuick.Layouts
import QtQuick.Controls.impl 2.15

import Quickshell
import Quickshell.Io
import Quickshell.Widgets

import Colors
import Utils

import qs.windows.bar

BarItem {
    id: root

    onClicked: {
        agsProc.running = true;
    }

    RowLayout {
        spacing: 10

        WrapperMouseArea {
            id: battery

            visible: BatteryHelper.device !== null
            propagateComposedEvents: true
            hoverEnabled: true

            onPressed: mouse => mouse.accepted = false

            BarRevealerText {
                text: `${(BatteryHelper.percentage * 100)}%`
                reveal: battery.containsMouse
                spacingText: 4

                BarText {
                    text: StringsHelper.symbolicStrength(BatteryHelper.percentage, [" ", " ", " ", " ", " "], 1)

                    color: {
                        if (BatteryHelper.percentage <= 0.3) {
                            return Colors.bad;
                        }

                        return Colors.text;
                    }
                }
            }
        }

        WrapperMouseArea {
            id: internet

            visible: NetworkingHelper.wifi !== null || NetworkingHelper.wired !== null
            propagateComposedEvents: true
            hoverEnabled: true

            onPressed: mouse => mouse.accepted = false

            BarRevealerText {
                spacingText: 4

                text: {
                    if (NetworkingHelper.wifiNetwork) {
                        return NetworkingHelper.wifiNetwork.name;
                    }

                    if (NetworkingHelper.wiredNetwork) {
                        return NetworkingHelper.wiredNetwork.name;
                    }

                    return "Disconnected";
                }

                reveal: internet.containsMouse

                // https://stackoverflow.com/questions/69964071/qt-qml-colorimage-is-not-a-type
                ColorImage {
                    sourceSize {
                        width: 15
                        height: 15
                    }

                    anchors.centerIn: parent

                    source: Quickshell.iconPath(NetworkingHelper.defaultIconName)
                    color: Colors.text
                }
            }
        }

        WrapperMouseArea {
            id: time

            hoverEnabled: true
            propagateComposedEvents: true

            onPressed: mouse => mouse.accepted = false

            BarRevealerText {
                text: Qt.formatDateTime(clock.date, "dddd, dd MMM yyyy")
                reveal: time.containsMouse
                spacingText: 10

                BarText {
                    text: Qt.formatDateTime(clock.date, "hh:mm")
                }
            }

            SystemClock {
                id: clock
                precision: SystemClock.Minutes
            }
        }
    }

    Process {
        id: agsProc
        command: ["ags", "request", "window glance"]
    }
}
