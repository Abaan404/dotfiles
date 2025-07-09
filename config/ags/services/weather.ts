import Gio from "gi://Gio";
import Soup from "gi://Soup";
import GLib from "gi://GLib";
import GObject, { register, getter } from "ags/gobject";
import { readFileAsync, writeFileAsync } from "ags/file";
import { interval, timeout } from "ags/time";

import AstalIO from "gi://AstalIO";

@register({ GTypeName: "Weather" })
export default class Weather extends GObject.Object {
    static instance: Weather;
    static get_default() {
        if (!this.instance)
            this.instance = new Weather();

        return this.instance;
    }

    private readonly cache = "!!HOME/.dotfiles/data/weather.json";
    private readonly api_key = GLib.getenv("OPENWEATHER_API_KEY");
    private timer: AstalIO.Time | null = null;
    private session = new Soup.Session();

    private _location = GLib.getenv("OPENWEATHER_LOCATION");
    private _temperature = 0;
    private _feels_like = 0;
    private _description = "Unavailable";
    private _windspeed = 0;
    private _visibility = 0;
    private _city_id = 0;
    private readonly _image_path = "!!HOME/.dotfiles/data/weather.png";

    @getter(String) get location() { return this._location || "Unknown"; }
    @getter(Number) get temperature() { return this._temperature; }
    @getter(Number) get feels_like() { return this._feels_like; }
    @getter(String) get description() { return this._description; }
    @getter(Number) get windspeed() { return this._windspeed; }
    @getter(Number) get visibility() { return this._visibility; }
    @getter(Number) get city_id() { return this._city_id; }
    @getter(String) get image_path() { return this._image_path; }

    set location(value) {
        if (value !== this._location && value !== "Unknown") {
            this._location = value;
            this.update();
        }
        else {
            this._location = value;
        }

        this.notify("location");
    }

    constructor() {
        super();

        if (this.api_key === null) {
            console.error("OPENWEATHER_API_KEY was not set, no weather data will be available");
            return;
        }

        this.start();
    }

    private async start() {
        // use cache if available, else create one (first run condition)
        await readFileAsync(this.cache)
            .then(async (file) => {
                try {
                    const weather = JSON.parse(file);

                    // if location hasnt changed, read cache
                    if (this._location === weather.location) {
                        this.update_props(JSON.parse(file));
                    }
                    // update otherwise
                    else {
                        this.update();
                    }
                }
                catch (e) {
                    // junk in file, update again
                    await writeFileAsync(this._image_path, "\0");
                    await this.update();
                }
            })
            .catch(async () => {
                // file doesnt exist, write a new one
                await writeFileAsync(this._image_path, "\0");
                this.update();
            });

        // run at exactly X:00:00
        timeout(new Date(Math.ceil(Date.now() / 3600000) * 3600000).getTime() - Date.now(), () => {
            if (this.timer !== null) {
                this.timer.cancel();
            }

            this.timer = interval(3600000, () => this.update());
        });
    }

    private stop() {
        if (this.timer) {
            this.timer.cancel();
            this.timer = null;
        }
    }

    private update_props(weather: {
        location: string;
        temperature: number;
        feels_like: number;
        description: string;
        windspeed: number;
        visibility: number;
        city_id: number;
    }) {
        this.location = weather.location;
        this._temperature = weather.temperature;
        this._feels_like = weather.feels_like;
        this._description = weather.description;
        this._windspeed = weather.windspeed;
        this._visibility = weather.visibility;
        this._city_id = weather.city_id;

        this.notify("location");
        this.notify("temperature");
        this.notify("feels_like");
        this.notify("description");
        this.notify("windspeed");
        this.notify("visibility");
        this.notify("city_id");
    }

    // good enough
    private async fetch(url: string) {
        const message = new Soup.Message({
            method: "GET",
            uri: GLib.Uri.parse(url, GLib.UriFlags.NONE),
        });

        Gio._promisify(Soup.Session.prototype, "send_async", "send_finish");
        const input_stream = await this.session.send_async(
            message,
            GLib.PRIORITY_DEFAULT,
            null,
        );

        return {
            status: message.status_code,

            async text() {
                const bytes = await this.bytes();
                return new TextDecoder().decode(bytes.toArray());
            },

            async json() {
                return JSON.parse(await this.text());
            },

            async bytes() {
                const output_stream = Gio.MemoryOutputStream.new_resizable();

                Gio._promisify(Gio.OutputStream.prototype, "splice_async", "splice_finish");
                await output_stream.splice_async(
                    input_stream,
                    Gio.OutputStreamSpliceFlags.CLOSE_TARGET | Gio.OutputStreamSpliceFlags.CLOSE_SOURCE,
                    GLib.PRIORITY_DEFAULT,
                    null,
                );

                return output_stream.steal_as_bytes();
            },
        };
    }

    async update() {
        try {
            if (this._location === null) {
                console.error("location name was not provided, no weather data will be available.");
                this.stop();
                return;
            }

            // https://openweathermap.org/api/geocoding-api
            // get lat and lon
            const location_data = await this.fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${this._location}&limit=1&appid=${this.api_key}`)
                .then((req) => {
                    if (req.status !== 200) {
                        this.stop();
                        throw `Could not resolve location data for ${this._location}`;
                    }
                    return req.json();
                });

            // https://openweathermap.org/current
            // get weather data
            const weather_data = await this.fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${location_data[0].lat}&lon=${location_data[0].lon}&appid=${this.api_key}`)
                .then((req) => {
                    if (req.status !== 200) {
                        this.stop();
                        throw `Could not resolve weather data for ${this._location}`;
                    }
                    return req.json();
                });

            // https://openweathermap.org/weather-conditions
            // get associated weather image
            await this.fetch(`https://openweathermap.org/img/wn/${weather_data.weather[0].icon}@2x.png`)
                .then(async (req) => {
                    if (req.status !== 200) {
                        this.stop();
                        throw `Could not resolve weather icon for ${this._location}`;
                    }

                    const file = Gio.File.new_for_path(this._image_path);

                    Gio._promisify(Gio.File.prototype, "open_readwrite_async", "open_readwrite_finish");
                    const stream = await file.open_readwrite_async(GLib.PRIORITY_DEFAULT, null);

                    Gio._promisify(Gio.OutputStream.prototype, "write_bytes_async", "write_bytes_finish");
                    await stream.get_output_stream().write_bytes_async(await req.bytes(), GLib.PRIORITY_DEFAULT, null);

                    this.notify("image_path");
                });

            const weather = {
                location: weather_data.name,
                temperature: weather_data.main.temp,
                feels_like: weather_data.main.feels_like,
                description: weather_data.weather[0].main,
                windspeed: weather_data.wind.speed,
                visibility: weather_data.visibility,
                city_id: weather_data.id,
            };

            this.update_props(weather);
            writeFileAsync(this.cache, JSON.stringify(weather, null, 4));
        }
        catch (error) {
            console.error(`An error occurred while updating weather data: ${error}`);
            this.update_props({
                location: "Unknown",
                temperature: 0,
                feels_like: 0,
                description: "Unavailable",
                windspeed: 0,
                visibility: 0,
                city_id: 0,
            });

            this.stop();
        }
    }
}
