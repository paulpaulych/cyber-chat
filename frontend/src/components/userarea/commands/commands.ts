import {LaunchProcess, Process} from "../terminal/process-api";

type CancellableInputHandler = (input: string, isCancelled: () => boolean) => void

type CancellableProcess = (simple: CancellableInputHandler) => Process

export const cancellable: CancellableProcess = (onInput) => {
        let cancelled = false
        return {
            onInput: (input) => onInput(input, () => cancelled),
            cancel: () => { cancelled = true }
        }
    }

export const cancellableEcho: LaunchProcess = ({setOutput}) =>
    cancellable((input, isCanceled) => {
        if (isCanceled()) {
            setOutput({ type: "exit", status: { code: "ok" } })
            return
        }
        setOutput({type: "regular", text: input})
    })

export const echo: LaunchProcess = ({setOutput}) => {
    return {
        onInput: (input) => setOutput({ type: "regular", text: input }),
        cancel: () => {}
    }
}

export const echoWithTimeout = (ms: number): LaunchProcess =>
    ({setOutput}) => ({
        onInput: (input) =>
            setTimeout(() => setOutput({ type: "regular", text: input }), ms),
        cancel: () => {
            console.log("cancel for echo twice not implemented")
        }
    })

export const echoTwiceAndExit: LaunchProcess = ({setOutput}) => {
    let i = 0
    return {
        onInput: (input) => {
            if (i > 1) {
                setOutput({ type: "exit", status: { code: "ok" } })
                return
            }
            setOutput({ type: "regular", text: i.toString() + ": " + input })
            i++
        },
        cancel: () => {
            console.log("cancel for echo twice not implemented")
        }
    };
}
