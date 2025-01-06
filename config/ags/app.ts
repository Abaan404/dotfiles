import { App } from "astal/gtk3";
import Hyprland from "gi://AstalHyprland";

import style from "./style.scss";
import Bar from "./windows/Bar";
import PowerMenu from "./windows/PowerMenu";
import Mpris from "./windows/Mpris"

import window_handler from "./helpers/window";

window_handler.register_window("powermenu", PowerMenu);
window_handler.register_window("mpris", Mpris);

App.start({
    css: style,
    main() {
        App.get_monitors().map(Bar);
    },

    requestHandler(request: string, res: (response: any) => void) {
        const requestv = request.split(" ");

        switch (requestv[0]) {
            case "window":
                const hyprland = Hyprland.get_default();
                const monitor_id = hyprland.get_focused_monitor().get_id();
                const monitor = App.get_monitors()[monitor_id];

                try {
                    window_handler.toggle_window(requestv[1], monitor);
                }
                catch (error) {
                    return res(error);
                }

                return res(`window ${requestv[1]} toggled.`);

            default:
                break;
        }

        return res("does not compute");
    },
});
