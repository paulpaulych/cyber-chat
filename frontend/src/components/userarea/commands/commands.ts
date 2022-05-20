import {LaunchProcess} from "../terminal/process-api";

export const echo: LaunchProcess = ({setOutput}) =>
    (input) =>
        setOutput({ type: "regular", text: input })

export const echoWithTimeout = (ms: number) =>
    ({setOutput}) =>
        (input) =>
            setTimeout(() => setOutput({ type: "regular", text: input }), ms)

export const echoTwiceAndExit: LaunchProcess = ({setOutput}) => {
    let i = 0
    return (input) => {
        if (i > 1) {
            setOutput({ type: "exit", status: { code: "ok" } })
            return
        }
        setOutput({ type: "regular", text: i.toString() + ": " + input })
        i++
    };
}
