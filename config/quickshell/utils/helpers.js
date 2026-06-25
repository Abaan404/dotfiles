function truncate(value, limit) {
    if (value.length < limit)
        return value;

    return `${value.slice(0, limit - 3)}...`;
}

function symbolicStrength(value, array, max) {
    const interp = Math.floor((value / max) * array.length);
    return array[Math.min(interp, array.length - 1)];
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
