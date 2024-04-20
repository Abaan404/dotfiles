import Gtk from "gi://Gtk?version=3.0";
import WindowHandler from "../window.js";

export default () => WindowHandler.new_window({
    class_name: "debug",
    window: {
        anchor: ["right"],
    },
    box: {
        spacing: 20,
        orientation: Gtk.Orientation.VERTICAL,
    },
    children: [],
});

