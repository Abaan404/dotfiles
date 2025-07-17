import GObject, { register, getter, signal } from "ags/gobject";
import AstalIO from "gi://AstalIO";
import AstalNotifd from "gi://AstalNotifd?version=0.1";
import { interval } from "ags/time";

const MAX_NOTIFICATION_TIMEOUT = 5000;

@register({ GTypeName: "NotificationQueue" })
export default class NotificationQueue extends GObject.Object {
    static instance: NotificationQueue;
    static get_default() {
        if (!this.instance)
            this.instance = new NotificationQueue();

        return this.instance;
    }

    private notifd = AstalNotifd.get_default();

    @getter(Array<NotificationData>)
    get queue() {
        return this._queue.map(([notification]) => notification);
    }

    private _queue: [NotificationData, number][] = [];

    private on_notified(id: number) {
        const idx = this._queue.findIndex(([notification]) => notification.id === id);

        if (idx !== -1) {
            this._queue[idx][0].hide();
            this._queue.splice(idx, 1);
        }

        const notification = this.notifd.get_notification(id);
        let timeout = MAX_NOTIFICATION_TIMEOUT;
        if (notification.get_expire_timeout() > 0 && notification.get_expire_timeout() < MAX_NOTIFICATION_TIMEOUT) {
            timeout = notification.get_expire_timeout();
        }

        const notification_data = new NotificationData(id, timeout);

        const signal = notification_data.connect("hide", (self: NotificationData) => {
            const idx = this._queue.findIndex(([notification]) => notification.id === id);
            if (idx === -1) {
                console.error("hiding a notification that was never in the queue.");
                return;
            }

            const [_, signal] = this._queue[idx];
            self.disconnect(signal); // oneshot

            this._queue.splice(idx, 1);
            this.notify("queue");
        });

        this._queue.push([notification_data, signal]);
        this.notify("queue");
    }

    private on_resolved(id: number) {
        const idx = this._queue.findIndex(([notification]) => notification.id === id);
        if (idx === -1) {
            return;
        }

        const [notification, signal] = this._queue[idx];
        notification.disconnect(signal);

        notification.hide();
        this._queue.splice(idx, 1);
        this.notify("queue");
    }

    constructor() {
        super();

        this.notifd.connect("notified", (_, id) => this.on_notified(id));
        this.notifd.connect("resolved", (_, id) => this.on_resolved(id));
    }
}

@register({ GTypeName: "NotificationData" })
export class NotificationData extends GObject.Object {
    static instance: NotificationData;

    readonly _step = 10;

    private timer: AstalIO.Time | null = null;

    private _id: number;
    private _duration: number;
    private _progress = 0;

    @getter(Number) get id() {
        return this._id;
    }

    @getter(Number) get progress() {
        return this._progress;
    }

    @getter(Number) get duration() {
        return this._duration;
    }

    start() {
        if (this.timer) {
            this.timer?.cancel();
            this.timer = null;
        }

        this._progress = this._duration;
        this.notify("progress");

        this.timer = interval(this._step, () => {
            this._progress -= this._step;
            this.notify("progress");

            if (this._progress <= 0) {
                this.hide();
            }
        });
    }

    @signal([], Number, {})
    hide() {
        this.timer?.cancel();
        this.timer = null;
        this._progress = 0;
        this.notify("progress");

        return this.id;
    }

    constructor(id: number, duration: number) {
        super();

        this._id = id;
        this._duration = duration;
        this.start();
    }
}
