import QtQuick
import QtQuick.Layouts
import QtQuick.Controls.impl 2.15

import Quickshell
import Quickshell.Io

import Colors

import qs.windows.bar

BarItem {
    property bool showSystray: false

    onClicked: showSystray = !showSystray

    RowLayout {
        spacing: 13

        RowLayout {
            id: mem

            function update(): void {
                memFile.reload();

                const totalKb = Number(memFile.text().match(/^MemTotal:\s+(\d+)/m)?.[1] ?? 0);
                const availableKb = Number(memFile.text().match(/^MemAvailable:\s+(\d+)/m)?.[1] ?? 0);

                const usedGb = (totalKb - availableKb) / (1024 * 1024);

                memText.text = `${Math.round(usedGb)}G`;
            }

            FileView {
                id: memFile
                path: "/proc/meminfo"
            }

            ColorImage {
                source: Quickshell.iconPath("nvidia-ram-symbolic")

                color: Colors.text

                sourceSize {
                    width: 14
                    height: 14
                }
            }

            BarText {
                id: memText

                text: "0G"
            }
        }

        RowLayout {
            id: cpu

            property int idle: 0
            property int total: 0

            // https://stackoverflow.com/questions/3017162/how-to-get-total-cpu-usage-in-linux-using-c/3017438#3017438
            function update(): void {
                statFile.reload();
                    // qmlformat off
                    const jiffies = statFile
                        .text()
                        .split("\n")[0]
                        .trim()
                        .split(/\s+/)
                        .slice(1)
                        .map(Number);
                    // qmlformat on

                const idle = jiffies[3] + jiffies[4];
                const total = jiffies.reduce((a, b) => a + b, 0);

                const totalOverPeriod = total - cpu.total;
                const idleOverPeriod = idle - cpu.idle;

                cpu.idle = idle;
                cpu.total = total;

                const usage = (1 - (idleOverPeriod / totalOverPeriod)) * 100;

                cpuText.text = `${usage.toFixed(1)}%`;
            }

            FileView {
                id: statFile
                path: "/proc/stat"
            }

            ColorImage {
                source: Quickshell.iconPath("applications-electronics-symbolic")

                color: Colors.text

                Layout.alignment: Qt.AlignCenter

                sourceSize {
                    width: 14
                    height: 14
                }
            }

            BarText {
                id: cpuText

                text: "0.0%"
            }
        }
    }

    Timer {
        interval: 1000
        running: true
        repeat: true

        onTriggered: {
            mem.update();
            cpu.update();
        }
    }
}
