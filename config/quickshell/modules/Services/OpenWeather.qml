pragma Singleton

import QtQml

import Quickshell
import Quickshell.Io

Singleton {
    id: root

    readonly property string apiKey: Quickshell.env("OPENWEATHER_API_KEY") ?? ""
    property string location: Quickshell.env("OPENWEATHER_LOCATION") ?? "Unknown"

    readonly property string cachePath: `${Quickshell.env("HOME")}/.dotfiles/data/weather.json`
    readonly property string imagePath: `${Quickshell.env("HOME")}/.dotfiles/data/weather.png`

    property real temperature: 0
    property real feelsLike: 0
    property string description: "Unavailable"
    property real windspeed: 0
    property real visibility: 0
    property int cityId: 0

    QtObject {
        id: internal

        function start() {
            cache.reload();

            alignTimer.running = true;
        }

        function stop() {
            alignTimer.running = false;
            timer.running = false;
        }

        function apply(weather) {
            root.location = weather?.location ?? "Unknown";
            root.temperature = weather?.temperature ?? 0;
            root.feelsLike = weather?.feelsLike ?? 0;
            root.description = weather?.description ?? "Unavailable";
            root.windspeed = weather?.windspeed ?? 0;
            root.visibility = weather?.visibility ?? 0;
            root.cityId = weather?.cityId ?? 0;
        }

        function fetch(url, responseType) {
            return new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url);

                if (responseType) {
                    xhr.responseType = responseType;
                }

                xhr.onreadystatechange = function () {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        resolve({
                            ok: xhr.status >= 200 && xhr.status < 300,
                            status: xhr.status,
                            json: function () {
                                return JSON.parse(xhr.responseText);
                            },
                            text: function () {
                                return xhr.responseText;
                            },
                            arrayBuffer: function () {
                                return xhr.response;
                            }
                        });
                    }
                };

                xhr.onerror = function () {
                    reject(new Error("Network error"));
                };

                xhr.send();
            });
        }

        function update() {
            if (root.location === "Unknown") {
                console.error("OPENWEATHER_LOCATION was not set, no weather data will be available");
                stop();
                return;
            }

            const location = encodeURIComponent(root.location);

            // https://openweathermap.org/api/geocoding-api
            // get lat and lon
            const locationDataPromise = fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${root.apiKey}`)
                // qmlformat off
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`Could not resolve location data for ${root.location}`);
                    }

                    return res.json();
                })
                .then(locationData => {
                    if (!locationData || locationData.length === 0) {
                        throw new Error(`No geocoding results for ${root.location}`);
                    }

                    return locationData;
                });
                // qmlformat on

            // https://openweathermap.org/current
            // get weather data
            const weatherDataPromise = locationDataPromise
                // qmlformat off
                .then(locationData => {
                    return fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${locationData[0].lat}&lon=${locationData[0].lon}&appid=${root.apiKey}`);
                })
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`Could not resolve weather data for ${root.location}`);
                    }

                    return res.json();
                });
                // qmlformat on

            // https://openweathermap.org/weather-conditions
            // get associated weather image
            const weatherIconPromise = weatherDataPromise
                // qmlformat off
                .then(weatherData => {
                    return fetch(`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`, "arraybuffer");
                })
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`Could not resolve weather icon for ${root.location}`);
                    }

                    return res.arrayBuffer();
                });
                // qmlformat on

            // qmlformat off
            weatherIconPromise
                .then(weatherIcon => image.setData(weatherIcon))
                .catch(err => console.error("Failed to fetch weather icon:", err));
            // qmlformat oon

            // qmlformat off
            weatherDataPromise
                .then(weatherData => {
                    const weather = {
                        location: weatherData.name,
                        temperature: weatherData.main.temp,
                        feelsLike: weatherData.main.feels_like,
                        description: weatherData.weather[0].main,
                        windspeed: weatherData.wind.speed,
                        visibility: weatherData.visibility,
                        cityId: weatherData.id
                    };

                    apply(weather);
                    cache.setText(JSON.stringify(weather, null, 4));
                })
                .catch(err => console.error("Failed to fetch weather data:", err));
            // qmlformat oon
        }
    }

    Component.onCompleted: {
        if (apiKey === "") {
            console.error("OPENWEATHER_API_KEY was not set, no weather data will be available");
            return;
        }

        internal.start();
    }

    FileView {
        id: cache
        path: root.cachePath
        printErrors: false

        // use cache if available, else create one
        onLoaded: {
            try {
                const weather = JSON.parse(text());

                if (root.location === weather.location) {
                    // if location hasnt changed, read cache
                    internal.apply(weather);
                } else {
                    // update otherwise
                    internal.update();
                }
            } catch (e) {
                // junk in file, update again
                internal.update();
            }
        }

        onLoadFailed: error => {
            if (error == FileViewError.FileNotFound) {
                // file doesnt exist, write a new one
                internal.update();
            }
        }
    }

    FileView {
        id: image
        path: root.imagePath
        printErrors: false
    }

    // run at exactly X:00:00
    Timer {
        id: alignTimer

        repeat: false
        interval: new Date(Math.ceil(Date.now() / 3600000) * 3600000).getTime() - Date.now()
        onTriggered: timer.start()
    }

    Timer {
        id: timer

        interval: 3600000
        repeat: true
        onTriggered: {
            internal.update()
        }
    }
}
