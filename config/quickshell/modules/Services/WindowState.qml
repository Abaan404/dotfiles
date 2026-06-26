pragma Singleton

import QtQuick

import Quickshell

Singleton {
    id: root

    property var windows: new Map()

    function register(name: string, window: PanelWindow): void {
        windows.set(name, window);
    }

    function open(name: string): void {
        if (windows.has(name)) {
            const window = windows.get(name);
            window.visible = true;
        }
    }

    function close(name: string): void {
        if (windows.has(name)) {
            const window = windows.get(name);
            window.visible = false;
        }
    }

    function toggle(name: string): void {
        if (windows.has(name)) {
            const window = windows.get(name);
            window.visible = !window.visible;
        }
    }
}
