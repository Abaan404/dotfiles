import GObject, { register, getter } from "ags/gobject";
import { monitorFile, readFileAsync } from "ags/file";
import { exec, execAsync } from "ags/process";
import { clamp } from "../utils/helpers";

@register({ GTypeName: "Brightness" })
export default class Brightness extends GObject.Object {
    static instance: Brightness;
    static get_default() {
        if (!this.instance)
            this.instance = new Brightness();

        return this.instance;
    }

    private _devices = new Map<string, BrightnessDevice>();

    @getter(Array<BrightnessDevice>)
    get devices() {
        return Array.from(this._devices.values());
    }

    private update_devices() {
        const devices_str = exec("brightnessctl -lm");
        const current_devices = [];

        for (const line of devices_str.split("\n")) {
            const [name, type, brightness, _, max_brightness] = line.split(",");
            current_devices.push(name);

            if (this._devices.has(name)) {
                continue;
            }

            if (!["leds", "backlight"].includes(type)) {
                continue;
            }

            const device = new BrightnessDevice(type, name, Number(brightness), Number(max_brightness));

            this._devices.set(name, device);
        }

        for (const [name, _] of this._devices) {
            if (current_devices.includes(name)) {
                continue;
            }

            this._devices.delete(name);
        }
    }

    constructor() {
        super();

        this.update_devices();
    }
}

@register({ GTypeName: "BrightnessDevice" })
class BrightnessDevice extends GObject.Object {
    declare static $gtype: GObject.GType<BrightnessDevice>;

    @getter(String)
    get type(): string {
        return this._type;
    }

    @getter(String)
    get name(): string {
        return this._name;
    }

    @getter(Number)
    get percentage(): number {
        return this._brightness / this._max_brightness;
    }

    set percentage(percent: number) {
        percent = clamp(percent, 0, 1);

        execAsync(`brightnessctl set -d ${this._name} ${Math.floor(percent * 100)}% -q`)
            .then(() => this.notify("percentage"))
            .catch(console.error);
    }

    private _name: string;
    private _type: string;
    private _max_brightness: number;
    private _brightness: number;

    constructor(type: string, name: string, brightness: number, max_brightness: number) {
        super();

        this._type = type;
        this._name = name;
        this._max_brightness = max_brightness;
        this._brightness = brightness;

        monitorFile(`/sys/class/${type}/${name}/brightness`, async (f) => {
            this._brightness = Number(await readFileAsync(f));
            this.notify("percentage");
        });
    }
}
