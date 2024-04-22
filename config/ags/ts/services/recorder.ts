import Gio from "gi://Gio";
import Service from "resource:///com/github/Aylur/ags/service.js";
import Audio from "resource:///com/github/Aylur/ags/service/audio.js";
import * as Utils from "resource:///com/github/Aylur/ags/utils.js";

class Recorder extends Service {
    static {
        Service.register(
            this,
            {},
            {
                "is_recording": ["boolean", "r"],
                "is_paused": ["boolean", "r"],
                "is_replay_paused": ["boolean", "r"],
                "mic_enabled": ["boolean", "rw"],
            },
        );
    }

    private readonly _path = "!!HOME/Videos/Replays/";
    private readonly _size = "300";
    private readonly _window = "screen";
    private readonly _framerate = "60";
    private readonly _container = "mp4";
    private readonly _quality = "very_high";
    private readonly _video_codec = "h264";
    private readonly _audio_codec = "opus";

    private get _speaker(): string { return `${Audio.speaker.name}.monitor`; }
    private get _mic(): string { return `${Audio.microphone.name}`; }

    private _is_recording = false;
    private _is_paused = false;
    private _is_replay_paused = false;
    private _mic_enabled = false;

    get is_recording(): boolean { return this._is_recording; }
    get is_paused(): boolean { return this._is_paused; }
    get is_replay_paused() { return this._is_replay_paused; }
    get mic_enabled(): boolean { return this._mic_enabled; }

    set mic_enabled(value) {
        this.updateProperty("mic_enabled", value);
        this.emit("changed");

        this.init_replay();
    }

    private _proc_replay: Gio.Subprocess | null = null;
    private _proc_record: Gio.Subprocess | null = null;

    constructor() {
        super();

        // re-init on speaker change
        Audio.connect("speaker-changed", async() => {
            await this.init_replay();
        });
    }

    private async init_replay(): Promise<void> {
        if (this._speaker == "null.monitor")
            return;

        const command = [
            "gpu-screen-recorder",
            "-w", this._window,
            "-c", this._container,
            "-q", this._quality,
            "-r", this._size,
            "-f", this._framerate,
            "-a", this._speaker,
            "-k", this._video_codec,
            "-ac", this._audio_codec,
            "-o", this._path,
        ];

        this._proc_replay?.force_exit(); // kill if alive
        this._proc_replay = Utils.subprocess(command, () => {}, () => {});
    }

    async replay(): Promise<void> {
        Utils.ensureDirectory(this._path);

        // SIGUSR1 = 10
        this._proc_replay?.send_signal(10);
    }

    async replay_playpause(): Promise<void> {
        // SIGUSR2 = 12
        this._proc_replay?.send_signal(12);
        this.updateProperty("is_replay_paused", !this._is_replay_paused);
    }

    async record(): Promise<void> {
        if (this._is_recording) {
            // SIGINT = 2
            this._proc_record?.send_signal(2);
            this.updateProperty("is_recording", false);
            this.updateProperty("is_paused", false);
            this.emit("changed");

            return;
        }

        const date = new Date();
        const command = [
            "gpu-screen-recorder",
            "-w", this._window,
            "-c", this._container,
            "-q", this._quality,
            "-f", this._framerate,
            "-k", this._video_codec,
            "-ac", this._audio_codec,
            // holy shit this is one of the worst things I've written
            "-o", `${this._path}Recording_${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}_${date.getHours().toString().padStart(2, "0")}-${date.getMinutes().toString().padStart(2, "0")}-${date.getSeconds().toString().padStart(2, "0")}.${this._container}`,
        ];

        this.updateProperty("is_recording", true);

        // mic needs to be before speaker else no worky
        if (this._mic_enabled) {
            command.push("-a", this._mic);
            command.push("-a", this._speaker);
        } else {
            command.push("-a", this._speaker);
        }

        Utils.ensureDirectory(this._path);
        this._proc_record = Utils.subprocess(command, () => {}, () => {});
        this.emit("changed");
    }

    async record_playpause(): Promise<void> {
        if (this._proc_record) {
            // SIGUSR2 = 12
            this._proc_record?.send_signal(12);
            this.updateProperty("is_paused", !this._is_paused);
            this.emit("changed");
        }
    }
}

const service = new Recorder;
export default service;
