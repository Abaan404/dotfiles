import QtQuick
import QtQuick.Layouts
import QtQuick.Controls.impl 2.15

import Quickshell
import Quickshell.Widgets
import Quickshell.Services.UPower

import Colors
import Utils

WrapperMouseArea {
    id: root

    implicitHeight: 80

    property Region region: Region {
        item: root
        radius: 20
    }

    hoverEnabled: true

    onClicked: {
        switch (PowerProfiles.profile) {
        case PowerProfile.Performance:
            PowerProfiles.profile = PowerProfile.PowerSaver;
            break;
        case PowerProfile.Balanced:
            if (PowerProfiles.hasPerformanceProfile) {
                PowerProfiles.profile = PowerProfile.Performance;
            } else {
                PowerProfiles.profile = PowerProfile.Balanced;
            }
            break;
        case PowerProfile.PowerSaver:
            PowerProfiles.profile = PowerProfile.Balanced;
            break;
        default:
            break;
        }
    }

    WrapperRectangle {
        id: rect

        color: ColorHelper.mouse(Colors.colors_color1, root.containsMouse, root.containsPress)
        radius: 20

        Behavior on color {
            ColorAnimation {
                duration: 200
            }
        }

        leftMargin: 28
        rightMargin: 28

        RowLayout {
            spacing: 30

            Text {
                Layout.minimumWidth: 0
                Layout.maximumWidth: 350
                Layout.fillWidth: true

                text: {
                    switch (PowerProfiles.profile) {
                    case PowerProfile.Performance:
                        return "Performance";
                    case PowerProfile.Balanced:
                        return "Balanced";
                    case PowerProfile.PowerSaver:
                        return "Power Saver";
                    default:
                        return "Unknown";
                    }
                }

                color: Colors.text
                elide: Text.ElideRight

                font {
                    pixelSize: 27
                    weight: Font.ExtraBold
                }
            }

            ColorImage {
                sourceSize {
                    width: 48
                    height: 48
                }

                color: Colors.text

                source: {
                    switch (PowerProfiles.profile) {
                    case PowerProfile.Performance:
                        return Quickshell.iconPath("power-profile-performance-symbolic");
                    case PowerProfile.Balanced:
                        return Quickshell.iconPath("power-profile-balanced-symbolic");
                    case PowerProfile.PowerSaver:
                        return Quickshell.iconPath("power-profile-power-saver-symbolic");
                    default:
                        return Quickshell.iconPath("dialog-warning");
                    }
                }
            }
        }
    }
}
