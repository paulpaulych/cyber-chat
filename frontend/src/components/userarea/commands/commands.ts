import {NEW_LINE, LaunchProcess, Process} from "../terminal/process-api";
import {sysPrint, sysExit} from "./system-call-ext";

type CancellableInputHandler = (input: string, isCancelled: () => boolean) => void

type CancellableProcess = (simple: CancellableInputHandler) => Process

export const cancellable: CancellableProcess = (onInput) => {
    let cancelled = false
    return {
        onInput: (input) => onInput(input, () => cancelled),
        onInterrupt: () => {
            cancelled = true
        }
    }
}

export const cancellableEcho: LaunchProcess = ({sysCall}) =>
    cancellable((input, isCanceled) => {
        if (isCanceled()) {
            sysCall({type: "exit", status: {code: "ok"}})
            return
        }
        sysCall(sysPrint([input]))
    })



export const echo: LaunchProcess = ({sysCall}) => {
    sysCall(sysPrint(["ECHO STARTED. print 'exit' to exit"]))
    const prelude = () => {
        sysCall(sysPrint([NEW_LINE, "", NEW_LINE, "type your text", NEW_LINE, "> "]))
    }
    prelude()
    return {
        onInterrupt: () => {
            console.log("echo interrupted")
        },
        onInput: (input) => {
            if (input === "exit") {
                sysCall(sysExit({ code:"ok" }))
                return
            }
            sysCall(sysPrint(["", NEW_LINE, "your text here", NEW_LINE, "> " + input]))
            prelude()
        }
    }
}

export const echoWithTimeout = (ms: number): LaunchProcess =>
    ({sysCall}) => ({
        onInput: (input) =>
            setTimeout(() => sysCall(sysPrint([input])), ms),
        onInterrupt: () => {
            console.log("cancel for echo twice not implemented")
        }
    })

export const echoTwiceAndExit: LaunchProcess = ({sysCall}) => {
    let i = 0
    return {
        onInput: (input) => {
            if (i > 1) {
                sysCall({type: "exit", status: {code: "ok"}})
                return
            }
            sysCall(sysPrint([i.toString() + ": " + input]))
            i++
        },
        onInterrupt: () => {
            console.log("cancel for echo twice not implemented")
        }
    };
}
