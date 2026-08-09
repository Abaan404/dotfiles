pragma Singleton

import QtQuick
import Quickshell

Singleton {
    function mouseWithColor(background: color, hover: color, containsMouse: bool, containsPress: bool): color {
        if (containsMouse && !containsPress) {
            return hover;
        }

        return background;
    }

    function mouse(background: color, containsMouse: bool, containsPress: bool): color {
        return mouseWithColor(background, Qt.lighter(background, 1.2), containsMouse, containsPress);
    }
}
