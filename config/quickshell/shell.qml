import QtQuick

import Quickshell
import Quickshell.Services.UPower

import qs.windows.bar
import qs.windows.mpris
import qs.windows.media
import qs.windows.glance
import qs.windows.notification
import qs.windows.menus.power
import qs.windows.menus.replay

import Services

ShellRoot {
    settings {
        watchFiles: false
    }

    Bar {}
    Power {}
    Replay {}
    Mpris {}
    Media {}
    Glance {}
    Notifications {}

    Connections {
        target: Recorder

        function onReplaySaved(path: string) {
            const notif = Qt.createComponent("NotifySend.qml").createObject(null, {
                appName: "recorder",
                summary: "Replay Saved!",
                actions: new Map([["view", "View"], ["edit", "Edit"]]),
                running: true
            });

            notif.action.connect(action => { // qmllint disable missing-property
                if (action === "view") {
                    Quickshell.execDetached(["vlc", path]);
                } else if (action === "edit") {
                    Quickshell.execDetached(["video-trimmer", path]);
                }
            });
        }

        function onRecordingChanged() {
            if (Recorder.recording) {
                const notif = Qt.createComponent("NotifySend.qml").createObject(null, {
                    appName: "recorder",
                    summary: "Recording Started!",
                    running: true
                });
            }
        }

        function onRecordingSaved(path: string) {
            const notif = Qt.createComponent("NotifySend.qml").createObject(null, {
                appName: "recorder",
                summary: "Recording Saved!",
                actions: new Map([["view", "View"], ["edit", "Edit"]]),
                running: true
            });

            notif.action.connect(action => { // qmllint disable missing-property
                if (action === "view") {
                    Quickshell.execDetached(["vlc", path]);
                } else if (action === "edit") {
                    Quickshell.execDetached(["video-trimmer", path]);
                }
            });
        }
    }

    Binding {
        target: Recorder
        property: "replaying"
        value: !UPower.onBattery
    }
}
