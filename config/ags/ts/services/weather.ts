import GLib from "gi://GLib";
import Gio from "gi://Gio";
import Service from "resource:///com/github/Aylur/ags/service.js";
import * as Utils from "resource:///com/github/Aylur/ags/utils.js";

interface WeatherData {
    location: string;
    temperature: number;
    feels_like: number;
    description: string;
    windspeed: number;
    visibility: number;
    city_id: number;
}

class Weather extends Service {
    static {
        Service.register(
            this,
            {},
            {
                "location": ["string", "rw"],
                "temperature": ["int", "r"],
                "feels-like": ["int", "r"],
                "description": ["string", "r"],
                "windspeed": ["int", "r"],
                "visibility": ["int", "r"],
                "image-path": ["string", "r"],
                "city-id": ["string", "r"],
            },
        );
    }

    private readonly cache_path = "!!HOME/.dotfiles/data/cache.json";
    private readonly cache_identifier = "weather";
    private readonly api_key = GLib.getenv("OPENWEATHER_API_KEY");
    private source_id: number | null = null;

    private _location = GLib.getenv("OPENWEATHER_LOCATION");
    private _temperature = 0;
    private _feels_like = 0;
    private _description = "Unavailable";
    private _windspeed = 0;
    private _visibility = 0;
    private _city_id = 0;
    private readonly _image_path = "!!HOME/.dotfiles/data/weather.png";

    get location(): string { return this._location || "Unknown"; }
    get temperature(): number { return this._temperature; }
    get feels_like(): number { return this._feels_like; }
    get description(): string { return this._description; }
    get windspeed(): number { return this._windspeed; }
    get visibility(): number { return this._visibility; }
    get image_path(): string { return this._image_path; }
    get city_id(): number { return this._city_id; }

    set location(value: string) {
        this._location = value;

        if (this.source_id === null)
            this.start();
    }

    constructor() {
        super();
        if (this.api_key === null) {
            console.error("OPENWEATHER_API_KEY was not set, no weather data will be available");
            return;
        }

        this.start();
    }

    private async start(): Promise<void> {
        // use cache if available, else create one (first run condition)
        await Utils.readFileAsync(this.cache_path)
            .then(async file => {
                if (JSON.parse(file)?.[this.cache_identifier] === undefined) {
                    await Utils.writeFile("\0", this._image_path);
                    await this.update();
                }
                this.set_props(JSON.parse(file)[this.cache_identifier]);
            })
            .catch(async() => {
                await Utils.writeFile("\0", this._image_path);
                await this.update();
            });

        // run at exactly X:00:00
        Utils.timeout(new Date(Math.ceil(Date.now() / 3600000) * 3600000).getTime() - Date.now(), () => {
            if (this.source_id === null)
                this.source_id = Utils.interval(3600000, () => this.update());
        });
    }

    private stop(): void {
        if (this.source_id !== null)
            GLib.source_remove(this.source_id);
    }

    private set_props(weather_data: WeatherData): void {
        this.updateProperty("location", weather_data.location);
        this.updateProperty("temperature", weather_data.temperature);
        this.updateProperty("feels_like", weather_data.feels_like);
        this.updateProperty("description", weather_data.description);
        this.updateProperty("windspeed", weather_data.windspeed);
        this.updateProperty("visibility", weather_data.visibility);
        this.updateProperty("city_id", weather_data.city_id);

        const data = Utils.readFileAsync(this.cache_path)
            .then(file => JSON.parse(file))
            .catch(() => ({}));

        Promise.resolve(data)[this.cache_identifier] = weather_data;
        Utils.writeFile(JSON.stringify(data, null, 4), this.cache_path);

        this.emit("changed");
    }

    async update(): Promise<void> {
        try {
            if (this._location === null) {
                console.error("location name was not provided, no weather data will be available.");
                this.stop();
                return;
            }

            // https://openweathermap.org/api/geocoding-api
            // get lat and lon
            const location_data = await Utils.fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${this._location}&limit=1&appid=${this.api_key}`)
                .then(req => {
                    if (req.status !== 200) {
                        this.stop();
                        throw `Could not resolve location data for ${this._location}`;
                    }
                    return req.json();
                });

            // https://openweathermap.org/current
            // get weather data
            const weather_data = await Utils.fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${location_data[0].lat}&lon=${location_data[0].lon}&appid=${this.api_key}`)
                .then(req => {
                    if (req.status !== 200) {
                        this.stop();
                        throw `Could not resolve weather data for ${this._location}`;
                    }
                    return req.json();
                });

            // https://openweathermap.org/weather-conditions
            // get associated weather image
            await Utils.fetch(`https://openweathermap.org/img/wn/${weather_data.weather[0].icon}@2x.png`)
                .then(async req => {
                    if (req.status !== 200) {
                        this.stop();
                        throw `Could not resolve weather icon for ${this._location}`;
                    }

                    // TODO open PR on ags for writing bytes using Utils.writeFile()
                    const img = await req.gBytes();
                    Gio.File.new_for_path(this._image_path).open_readwrite_async(GLib.PRIORITY_DEFAULT, null, (source, result) => {
                        const stream = source.create_readwrite_finish(result);
                        stream.get_output_stream().write_bytes_async(img, GLib.PRIORITY_DEFAULT, null, (source, result) => source.write_bytes_finish(result));
                    });
                });

            this.set_props({
                location: weather_data.name,
                temperature: weather_data.main.temp,
                feels_like: weather_data.main.feels_like,
                description: weather_data.weather[0].main,
                windspeed: weather_data.wind.speed,
                visibility: weather_data.visibility,
                city_id: weather_data.id,
            });

        } catch (error) {
            console.error(`An error occurred while updating weather data: ${error}`);
            this.set_props({
                location: this.location,
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

const service = new Weather;
export default service;
