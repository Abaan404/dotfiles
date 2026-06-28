pragma Singleton

import QtQuick
import Quickshell

Singleton {
    function mouse(background: color, containsMouse: bool, containsPress, bool): color {
        if (containsMouse && !containsPress) {
            return Qt.lighter(background, 1.2);
        }

        return background;
    }
}
