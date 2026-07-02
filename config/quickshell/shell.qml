import QtQuick

import Quickshell

import qs.windows.bar
import qs.windows.mpris
import qs.windows.media
import qs.windows.notification
import qs.windows.menus.power
import qs.windows.menus.replay

ShellRoot {
    settings {
        watchFiles: false
    }

    Bar {}
    Power {}
    Replay {}
    Mpris {}
    Media {}
    Notifications {}
}
