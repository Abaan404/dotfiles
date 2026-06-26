import Quickshell.Io

import Services

IpcHandler {
    function open(): void {
        WindowState.open(target);
    }

    function close(): void {
        WindowState.close(target);
    }

    function toggle(): void {
        WindowState.toggle(target);
    }
}
