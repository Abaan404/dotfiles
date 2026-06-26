pragma Singleton

import Quickshell

Singleton {
    function clamp(value: real, min: real, max: real): real {
        return Math.min(Math.max(value, min), max);
    }
}
