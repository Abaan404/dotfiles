import Gio from "gi://Gio";
import GObject from "gi://GObject";
import GLib from "gi://GLib";
import { register, property, getter } from "ags/gobject";
import { execAsync, subprocess } from "ags/process";

import AstalIO from "gi://AstalIO";
import App from "ags/gtk4/app";
import { timeout } from "ags/time";

@register({ GTypeName: "Recorder" })
export default class Recorder extends GObject.Object {
    static instance: Recorder;
    static get_default() {
        if (!this.instance)
            this.instance = new Recorder();

        return this.instance;
    }

    private readonly _path = Gio.file_new_for_path("!!HOME/Videos/Replays");
    private readonly _size = "300";
    private readonly _framerate = "60";
    private readonly _container = "mp4";
    private readonly _quality = "medium";
    private readonly _video_codec = "h264"; // discord doesnt support h265/hvec
    private readonly _audio_codec = "opus";

    private _is_paused = true;
    private _is_mic_enabled = false;

    private _proc_replay: AstalIO.Process | null = null;
    private _proc_record: AstalIO.Process | null = null;

    private _record_path = "";
    private _replay_path = "";

    @property(String) window_replay = "screen";
    @property(String) window_record = "portal";

    @getter(Boolean) get is_mic_enabled() { return this._is_mic_enabled; };
    @getter(Boolean) get is_replaying() { return this._proc_replay !== null; }
    @getter(Boolean) get is_recording() { return this._proc_record !== null; }
    @getter(Boolean) get is_paused() { return this._is_paused; }

    @getter(String) get record_path() { return this._record_path; }
    @getter(String) get replay_path() { return this._replay_path; }

    set is_mic_enabled(value) {
        if (this._is_mic_enabled === value) {
            return;
        }

        this._is_mic_enabled = value;
        this.setup_replay();
        this.notify("is_mic_enabled");
    }

    set is_paused(value) {
        if (this._is_paused === value) {
            return;
        }

        // Send signal SIGUSR2 to gpu-screen-recorder (killall -SIGUSR2 gpu-screen-recorder) to pause/unpause recording. Only applicable and useful when recording (not streaming nor replay).
        this._proc_record?.signal(12);
        this._is_paused = value;
        this.notify("is_paused");
    }

    set is_replaying(value) {
        if (this.is_replaying === value) {
            return;
        }

        if (this.is_replaying) {
            this._proc_replay?.kill();
            this._proc_replay = null;
            this.notify("is_replaying");
        }
        else {
            this.setup_replay();
        }
    }

    async replay() {
        if (!this.is_replaying) {
            return;
        }

        if (!this._path.query_exists(null)) {
            this._path.make_directory(null);
        }

        // Send signal SIGUSR1 to gpu-screen-recorder (killall -SIGUSR1 gpu-screen-recorder) to save a replay (when in replay mode).
        this._proc_replay?.signal(10);
        timeout(1000, () => execAsync(["ls", "-t1", this._path.get_path()!]).then((res) => {
            this._replay_path = this._path.get_path()! + `/${res.split("\n")[0]}`;
            this.notify("replay_path");
        }));
    }

    async record(begin_recording = true) {
        // no change
        if (this.is_recording === begin_recording) {
            return;
        }

        if (!begin_recording) {
            // Send signal SIGINT to gpu-screen-recorder (Ctrl+C, or killall -SIGINT gpu-screen-recorder) to stop and save the recording. When in replay mode this stops recording without saving.
            this._proc_record?.signal(2);
            this.notify("record_path");

            // this._proc_record?.kill(); // dont kill the process so it can save itself
            this._proc_record = null;
            this.notify("is_recording");

            this._is_paused = true;
            this.notify("is_paused");
            return;
        }

        this._record_path = this._path.get_path()! + GLib.DateTime.new_now_local().format(`/Recording_%Y-%e-%d_%H-%M-%S.${this._container}`);

        const command = [
            "gpu-screen-recorder",
            "-v", "no",
            "-w", this.window_record,
            "-c", this._container,
            "-q", this._quality,
            "-f", this._framerate,
            "-k", this._video_codec,
            "-ac", this._audio_codec,
            "-o", this._record_path,
        ];

        if (this._is_mic_enabled) {
            command.push("-a", `default_output|default_input`);
        }
        else {
            command.push("-a", `default_output`);
        }

        if (!this._path.query_exists(null)) {
            this._path.make_directory(null);
        }

        this._proc_record = subprocess(command);
        this._proc_record.connect("exit", () => {
            this._proc_record = null;
            this.notify("is_recording");

            this._is_paused = true;
            this.notify("is_paused");
        });
        this.notify("is_recording");

        this._is_paused = false;
        this.notify("is_paused");
    }

    private setup_replay() {
        const command = [
            "gpu-screen-recorder",
            "-v", "no",
            "-w", this.window_replay,
            "-c", this._container,
            "-q", this._quality,
            "-r", this._size,
            "-f", this._framerate,
            "-k", this._video_codec,
            "-ac", this._audio_codec,
            "-o", this._path.get_path()!,
        ];

        if (this._is_mic_enabled) {
            command.push("-a", `default_output|default_input`);
        }
        else {
            command.push("-a", `default_output`);
        }

        this._proc_replay?.kill(); // kill if alive
        this._proc_replay = subprocess(command, () => {}, () => {});
        this.notify("is_replaying");
    }

    constructor() {
        super();

        this.setup_replay();

        // kill on app shutdown
        App.connect("shutdown", () => {
            this._proc_record?.kill();
            this._proc_replay?.kill();
        });
    }
}
