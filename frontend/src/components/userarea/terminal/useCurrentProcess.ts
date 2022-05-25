import {LaunchProcess, OnInput, Process} from "./api/process-api";
import {useCallback, useState} from "react";
import {ExitStatus, Printable, SysCall} from "./api/system-call";

export type CurrentProcessHook =
    | {
    state: "active"
    interrupt: () => void
    handleInput: OnInput
}
    | {
    state: "none",
    startProcess: StartProcess
}

export type ProcessExit = {
    cmd: string,
    exitStatus: ExitStatus
}

export type StartProcess = (cmd: string) => void

export function useCurrentProcess(props: {
    launchers: { cmd: string, launch: LaunchProcess }[]
    onStartFailed: (cmd: string) => void
    onExit: (exit: ProcessExit) => void
    onPrint: (o: Printable[]) => void
}): CurrentProcessHook {
    const [curProcess, setCurProcess] = useState<Process | null>(null)

    const detachProcess = useCallback(() => {
        setCurProcess(null)
    }, [])

    const handleSysCall = useCallback((from: string, call: SysCall) => {
        console.log("call: " + JSON.stringify(call))
        switch (call.type) {
            case "print": {
                props.onPrint(call.values)
                break
            }
            case "exit": {
                props.onExit({cmd: from, exitStatus: call.status})
                detachProcess()
                break
            }
        }
    }, [detachProcess, props])

    const startProcess = useCallback((cmd: string) => {
        const launcher = props.launchers.find(f => f.cmd === cmd)
        if (!launcher) {
            props.onStartFailed(cmd)
            return
        }

        setCurProcess(launcher.launch({sysCall: (call) => handleSysCall(cmd, call)}))
    }, [props, handleSysCall])

    const interruptProcess = () => {
        curProcess.onInterrupt()
        detachProcess()
    }

    if (curProcess === null) {
        return { state: "none", startProcess }
    }

    return {
        state: "active",
        handleInput: curProcess.onInput,
        interrupt: interruptProcess
    }
}