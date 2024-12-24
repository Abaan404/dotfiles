export function to_timestamp(value: number) {
    const hour = Math.round(value / 3600).toString().padStart(2, "0");
    const minute = Math.round(value / 60 % 60).toString().padStart(2, "0");
    const second = Math.round(value % 60).toString().padStart(2, "0");

    if (value > 3600)
        return `${hour}:${minute}:${second}`;
    else
        return `${minute}:${second}`;
}

export function truncate(value: string, limit: number) {
    if (value.length < limit)
        return value;

    return `${value.slice(0, limit - 3)}...`;
}
