pragma ComponentBehavior: Bound

import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

import Quickshell
import Quickshell.Widgets

import Colors
import Utils

WrapperRectangle {
    QtObject {
        id: internal

        property date datetime: new Date()
    }

    color: Colors.primary
    radius: 20

    ColumnLayout {
        spacing: 0

        WrapperItem {
            margin: 8

            Layout.alignment: Qt.AlignHCenter

            ColumnLayout {
                spacing: 0

                RowLayout {
                    spacing: 10

                    Layout.alignment: Qt.AlignHCenter

                    WrapperMouseArea {
                        acceptedButtons: Qt.LeftButton | Qt.RightButton
                        hoverEnabled: true

                        onClicked: event => {
                            const month = internal.datetime.getMonth();

                            if (event.button === Qt.LeftButton) {
                                internal.datetime.setMonth(month + 1);
                            } else if (event.button === Qt.RightButton) {
                                internal.datetime.setMonth(month - 1);
                            }
                        }

                        Text {
                            text: Qt.formatDateTime(internal.datetime, "MMMM")
                            color: ColorHelper.mouse(Colors.text, parent.containsMouse, parent.containsPress)

                            Behavior on color {
                                ColorAnimation {
                                    duration: 200
                                }
                            }

                            font {
                                pixelSize: 20
                                weight: Font.ExtraBold
                            }
                        }
                    }

                    WrapperMouseArea {
                        acceptedButtons: Qt.LeftButton | Qt.RightButton
                        hoverEnabled: true

                        onClicked: event => {
                            const year = internal.datetime.getFullYear();

                            if (event.button === Qt.LeftButton) {
                                internal.datetime.setFullYear(year + 1);
                            } else if (event.button === Qt.RightButton) {
                                internal.datetime.setFullYear(year - 1);
                            }
                        }

                        Text {
                            text: Qt.formatDateTime(internal.datetime, "yyyy")
                            color: ColorHelper.mouse(Colors.text, parent.containsMouse, parent.containsPress)

                            Behavior on color {
                                ColorAnimation {
                                    duration: 200
                                }
                            }

                            font {
                                pixelSize: 20
                                weight: Font.ExtraBold
                            }
                        }
                    }
                }

                Text {
                    Layout.alignment: Qt.AlignHCenter

                    text: Qt.formatDateTime(clock.date, "HH : mm : ss")

                    color: Colors.text

                    font {
                        pixelSize: 28
                        weight: Font.ExtraBold
                    }

                    SystemClock {
                        id: clock
                        precision: SystemClock.Seconds
                    }
                }
            }
        }

        Rectangle {
            radius: 20
            color: Colors.colors_color1

            Layout.fillWidth: true
            Layout.fillHeight: true

            ColumnLayout {
                anchors.margins: 10

                anchors.fill: parent

                DayOfWeekRow {
                    Layout.fillWidth: true

                    locale: Qt.locale()

                    delegate: Text {
                        required property var modelData
                        required property string shortName

                        text: shortName
                        horizontalAlignment: Text.AlignHCenter
                        verticalAlignment: Text.AlignVCenter

                        color: Colors.text

                        font {
                            weight: Font.ExtraBold
                        }
                    }
                }

                MonthGrid {
                    id: monthGrid

                    Layout.fillHeight: true
                    Layout.fillWidth: true

                    month: internal.datetime.getMonth()
                    year: internal.datetime.getFullYear()
                    locale: Qt.locale()

                    delegate: Rectangle {
                        required property var modelData

                        color: modelData.today ? Colors.primary : "transparent"
                        radius: 20

                        Text {
                            anchors.centerIn: parent

                            horizontalAlignment: Text.AlignHCenter
                            verticalAlignment: Text.AlignVCenter
                            text: parent.modelData.day

                            color: parent.modelData.month === monthGrid.month ? Colors.text : Qt.darker(Colors.text, 1.6)

                            font {
                                pixelSize: 14
                            }
                        }
                    }
                }
            }
        }
    }
}
