// https://stackoverflow.com/a/50224584

pragma Singleton

import QtQml

import Quickshell

Singleton {
    id: root

    function setTimeout(cb, delayTime): Timer {
        let timer = Qt.createQmlObject("import QtQml; Timer {}", root);
        timer.interval = delayTime;
        timer.repeat = false;
        timer.triggered.connect(cb);
        timer.triggered.connect(function release() {
            timer.triggered.disconnect(cb); // This is important
            timer.triggered.disconnect(release); // This is important as well
        });
        timer.start();

        return timer;
    }
}
