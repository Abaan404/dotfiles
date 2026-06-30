pragma ComponentBehavior: Bound

import QtQuick
import QtQuick.Effects
import QtQuick.Layouts

import Quickshell.Widgets
import Quickshell.Services.Notifications

import Colors

WrapperRectangle {
    id: root

    required property Notification notification

    radius: 10
    color: Colors.secondary

    Layout.fillWidth: true

    RowLayout {
        spacing: 0

        Loader {
            active: root.notification.image !== ""
            visible: active

            Layout.fillHeight: true
            Layout.preferredWidth: height

            sourceComponent: Item {
                Rectangle {
                    radius: 10
                    anchors.fill: parent
                    color: Qt.lighter(Colors.secondary, 1.2)
                }

                IconImage {
                    id: image

                    anchors.fill: parent
                    source: root.notification.image
                    visible: false
                }

                // https://forum.qt.io/topic/145956/rounded-image-in-qt6/6
                MultiEffect {
                    source: image
                    anchors.fill: image
                    maskEnabled: true
                    maskSource: mask
                    maskSpreadAtMin: 1.0
                    maskThresholdMin: 0.5
                }

                Item {
                    id: mask
                    anchors.fill: parent
                    layer.enabled: true
                    visible: false

                    Rectangle {
                        anchors.fill: parent
                        radius: 10
                    }
                }
            }
        }

        WrapperItem {
            margin: 10
            rightMargin: 20

            Layout.fillWidth: true
            implicitHeight: bodyMetrics.height * 2 + summaryMetrics.height * 2 // eyeballing

            ColumnLayout {
                spacing: 0

                Layout.fillWidth: true

                Text {
                    id: summary

                    text: root.notification.summary
                    color: Colors.text

                    elide: Text.ElideRight

                    Layout.fillWidth: true
                    Layout.alignment: Qt.AlignVCenter

                    font {
                        pixelSize: 18
                        weight: Font.ExtraBold
                    }

                    FontMetrics {
                        id: summaryMetrics
                        font: summary.font
                    }
                }

                Text {
                    id: body

                    visible: root.notification.body !== ""
                    text: root.notification.body
                    color: Colors.text

                    elide: Text.ElideRight
                    wrapMode: Text.WordWrap
                    maximumLineCount: 2

                    Layout.fillWidth: true
                    Layout.alignment: Qt.AlignTop

                    font {
                        pixelSize: 13
                        weight: Font.DemiBold
                    }

                    FontMetrics {
                        id: bodyMetrics
                        font: body.font
                    }
                }
            }
        }
    }
}
