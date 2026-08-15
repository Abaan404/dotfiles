import QtQml

import Quickshell.Io

import Utils

QtObject {
    id: root

    required property string type
    required property string name

    property real percentage: internal.maxBrightness > 0 ? internal.brightness / internal.maxBrightness : 0

    onPercentageChanged: {
        percentage = MathHelper.clamp(percentage, 0, 1);

        setProc.percentage = percentage;
        setProc.running = true;
    }

    function initInternal(brightness: real, maxBrightness: real): void {
        internal.brightness = brightness;
        internal.maxBrightness = maxBrightness;

        percentage = internal.maxBrightness > 0 ? internal.brightness / internal.maxBrightness : 0;
    }

    property QtObject internal: QtObject {
        id: internal

        property real brightness: 0
        property real maxBrightness: 1
    }

    property Process setProc: Process {
        property real percentage: 0

        command: ["brightnessctl", "set", "-d", root.name, `${Math.floor(percentage * 100)}%`, "-q"]
    }

    property FileView fileView: FileView {
        path: `/sys/class/${root.type}/${root.name}/brightness`
        watchChanges: true
        onFileChanged: reload()
        onTextChanged: {
            internal.brightness = Number(text());
            root.percentage = internal.maxBrightness > 0 ? internal.brightness / internal.maxBrightness : 0;
        }
    }
}
