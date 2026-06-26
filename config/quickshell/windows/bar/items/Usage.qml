import QtQuick
import QtQuick.Layouts

import Quickshell.Io

import qs.windows.bar

BarItem {
    property bool showSystray: false

    onClicked: showSystray = !showSystray

    RowLayout {
        spacing: 13

        BarText {
            id: mem
        }

        BarText {
            id: cpu
        }
    }

    Process {
        id: cpuProc

        command: ["bash", "-c", "top -bn1 | sed -n '/Cpu/p' | awk '{print $2}' | sed 's/..,//'"]
        running: true

        stdout: StdioCollector {
            onStreamFinished: cpu.text = ` ${this.text.trim()}%`
        }
    }

    Process {
        id: memProc

        command: ["bash", "-c", "free -hg | awk 'NR == 2 {print $3}' | sed 's/Gi/G/'"]
        running: true

        stdout: StdioCollector {
            onStreamFinished: mem.text = ` ${this.text.trim()}`
        }
    }

    Timer {
        interval: 2000
        running: true
        repeat: true
        onTriggered: {
            memProc.running = true;
            cpuProc.running = true;
        }
    }
}
