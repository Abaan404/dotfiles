import QtQuick

import Quickshell

import qs.windows.bar
import qs.windows.power
import qs.windows.mpris
import qs.windows.media

ShellRoot {
    settings {
        watchFiles: false
    }

    Bar {}
    Power {}
    Mpris {}
    Media {}
}
