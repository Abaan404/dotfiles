pragma Singleton

import Quickshell

Singleton {
    function truncate(value: string, limit: int): string {
        if (value.length < limit)
            return value;

        return `${value.slice(0, limit - 3)}...`;
    }

    function symbolicStrength(value: real, array: list<var>, max: real): var {
        const interp = Math.floor((value / max) * array.length);
        return array[Math.min(interp, array.length - 1)];
    }
}
