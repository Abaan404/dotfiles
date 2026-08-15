pragma Singleton

import QtQml

import Quickshell
import Quickshell.Io

Singleton {
    id: root

    property list<BrightnessDevice> devices

    Process {
        id: devicesProc
        command: ["brightnessctl", "-lm"]

        stdout: StdioCollector {
            onStreamFinished: {
                for (const line of text.trim().split("\n")) {
                    if (!line) {
                        continue;
                    }

                    const [name, type, brightness, _, maxBrightness] = line.split(",");

                    if (!["leds", "backlight"].includes(type)) {
                        continue;
                    }

                    const device = Qt.createComponent("BrightnessDevice.qml").createObject(root, {
                        type: type,
                        name: name
                    });

                    device.initInternal(brightness, maxBrightness); // qmllint disable missing-property
                    root.devices.push(device);
                }
            }
        }
    }

    Component.onCompleted: devicesProc.running = true
}
