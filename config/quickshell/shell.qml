import QtQuick

import Quickshell

import qs.windows.bar
import qs.windows.power

ShellRoot {
    settings {
        watchFiles: false
    }

    Bar {}
    Power {}
}
