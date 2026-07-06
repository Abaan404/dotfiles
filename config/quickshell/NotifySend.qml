import Quickshell.Io

Process {
    id: root

    property string appName: "quickshell"
    property string summary: ""
    property string body: ""

    property int timeout: 5000
    property var actions: new Map()

    signal action(action: string)

    command: {
        let command = ["notify-send"];

        if (summary !== "") {
            command.push(summary);
        }

        if (body !== "") {
            command.push(body);
        }

        if (appName !== "") {
            command.push("--app-name", appName);
        }

        if (timeout > 0) {
            command.push("--expire-time", timeout);
        }

        for (let [name, text] of actions) {
            command.push(`--action=${name}=${text}`);
        }

        console.log(command.join(" "));

        return command;
    }

    stdout: StdioCollector {
        id: replayStdout
        onStreamFinished: root.action(this.text.trim())
    }

    onExited: { // qmllint disable signal-handler-parameters
        destroy();
    }
}
