import QtQuick

import Quickshell

import qs.windows.bar
import qs.windows.power
import qs.windows.mpris
import qs.windows.media
import qs.windows.notification

ShellRoot {
    settings {
        watchFiles: false
    }

    Bar {}
    Power {}
    Mpris {}
    Media {}
    Notifications {}
}
