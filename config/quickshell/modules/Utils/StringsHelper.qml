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

    function toTimestamp(value: int): string {
        const hour = Math.round(value / 3600).toString().padStart(2, "0");
        const minute = Math.round(value / 60 % 60).toString().padStart(2, "0");
        const second = Math.round(value % 60).toString().padStart(2, "0");

        if (value > 3600)
            return `${hour}:${minute}:${second}`;
        else
            return `${minute}:${second}`;
    }
}
