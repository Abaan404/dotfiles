pragma Singleton

import QtQml

import Quickshell
import Quickshell.Io

Singleton {
    id: root

    readonly property string replayDirectory: Quickshell.env("HOME") + "/Videos/Replays"

    property string windowReplay: "screen"
    property string windowRecord: "screen"

    property bool replaying: false
    property bool recording: false
    readonly property alias paused: recordProc.paused // keep it readonly but let it mutate internally
    property bool micEnabled: true

    property string container: "mp4"
    property string quality: "medium"
    property string framerate: "60"
    property string replayLength: "300"
    property string videoCodec: "h264"
    property string audioCodec: "opus"

    signal replaySaved(path: string)
    signal recordingSaved(path: string)

    onRecordingChanged: {
        recordProc.outputPath = `${replayDirectory}/Recording_${Qt.formatDateTime(new Date(), "yyyy-MM-dd_hh-mm-ss")}.${container}`;
        recordProc.running = recording;
    }

    onReplayingChanged: {
        replayProc.running = replaying;
    }

    onMicEnabledChanged: {
        if (replaying) {
            replayProc.restarting = true;
        }

        replaying = false;
        recording = false;
    }

    function playPause() {
        recordProc.playPause();
    }

    function replay() {
        replayProc.replay();
    }

    Component.onCompleted: {
        replaying = true;
    }

    Component.onDestruction: {
        replaying = false;
        recording = false;
    }

    Process {
        id: replayProc

        property bool restarting: false

        function replay(): void {
            if (!running) {
                return;
            }

            replayProc.signal(10); // SIGUSR1
            replayTimeout.start();
        }

        // qmlformat off
        command: [
            "gpu-screen-recorder",
            "-v", "no",
            "-w", root.windowReplay,
            "-c", root.container,
            "-q", root.quality,
            "-r", root.replayLength,
            "-f", root.framerate,
            "-k", root.videoCodec,
            "-ac", root.audioCodec,
            "-a", root.micEnabled ? "default_output|default_input" : "default_output",
            "-o", root.replayDirectory,
        ]
        // qmlformat on

        stdout: StdioCollector {
            id: replayStdout
            waitForEnd: false
        }

        onExited: { // qmllint disable signal-handler-parameters
            root.replaying = restarting;
            restarting = false;
        }
    }

    Timer {
        id: replayTimeout
        interval: 1000
        running: false
        repeat: false
        onTriggered: {
            const paths = replayStdout.text.trim().split("\n");
            root.replaySaved(paths[paths.length - 1]);
        }
    }

    Process {
        id: recordProc

        property string outputPath: ""
        property bool paused: true

        // gpu-screen-recorder doesnt have a way to force play or pause
        function playPause(): void {
            if (!running) {
                return;
            }

            signal(12); // SIGUSR2
            paused = !paused;
        }

        // qmlformat off
        command: [
            "gpu-screen-recorder",
            "-v", "no",
            "-w", root.windowRecord,
            "-c", root.container,
            "-q", root.quality,
            "-f", root.framerate,
            "-k", root.videoCodec,
            "-ac", root.audioCodec,
            "-a", root.micEnabled ? "default_output|default_input" : "default_output",
            "-o", outputPath,
        ]
        // qmlformat on

        onStarted: {
            paused = true;
        }

        onExited: { // qmllint disable signal-handler-parameters
            root.recording = false;
            paused = true;

            root.recordingSaved(outputPath);
        }
    }
}
