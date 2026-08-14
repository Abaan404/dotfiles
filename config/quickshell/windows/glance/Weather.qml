import QtQuick
import QtQuick.Layouts

import Quickshell
import Quickshell.Widgets

import Services
import Colors
import Utils

WrapperMouseArea {
    id: root

    property Region region: Region {
        item: root
        radius: 20
    }

    hoverEnabled: true

    WrapperRectangle {
        id: rect

        color: ColorHelper.mouse(Colors.colors_color1, root.containsMouse, root.containsPress)
        radius: 20

        Behavior on color {
            ColorAnimation {
                duration: 200
            }
        }

        ColumnLayout {
            spacing: 0

            RowLayout {
                spacing: 10

                Layout.leftMargin: 14
                Layout.rightMargin: 14

                Image {
                    source: OpenWeather.imagePath
                }

                ColumnLayout {
                    spacing: 0

                    Layout.rightMargin: 14

                    Text {
                        Layout.minimumWidth: 0
                        Layout.maximumWidth: 350
                        Layout.fillWidth: true

                        text: OpenWeather.description
                        color: Colors.text

                        elide: Text.ElideRight

                        font {
                            pixelSize: 24
                            weight: Font.ExtraBold
                        }
                    }

                    Text {
                        text: `${(OpenWeather.temperature - 273.15).toFixed(1)}°C`
                        color: Colors.text

                        font {
                            pixelSize: 16
                            weight: Font.ExtraBold
                        }
                    }
                }
            }

            RowLayout {
                clip: true

                Layout.leftMargin: 16
                Layout.rightMargin: 16

                Layout.preferredHeight: root.containsMouse ? implicitHeight : 0

                Text {
                    text: `${OpenWeather.windspeed.toFixed(1)}km/h`
                    bottomPadding: 10
                    color: Colors.text

                    font {
                        pixelSize: 14
                        weight: Font.ExtraBold
                    }
                }

                Item {
                    Layout.fillWidth: true
                }

                Text {
                    Layout.alignment: Qt.AlignRight

                    text: `${(OpenWeather.feelsLike - 273.15).toFixed(1)}°C`
                    bottomPadding: 10
                    color: Colors.text

                    font {
                        pixelSize: 14
                        weight: Font.ExtraBold
                    }
                }

                Behavior on Layout.preferredHeight {
                    NumberAnimation {
                        duration: 400
                        easing.type: Easing.OutCubic
                    }
                }
            }
        }
    }
}
