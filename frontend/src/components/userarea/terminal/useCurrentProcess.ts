import {MyState, useMyState} from "./useMyState";
import {ExitStatus, LaunchProcess, OnInput, Process, ProcessOutput} from "./process-api";
import {useCallback, useState} from "react";

export type CurrentProcessHook =
    | {
    state: "active"
    cmd: string
    output: MyState<string>
    cancel: () => void
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
}): CurrentProcessHook {

    const [output, setOutput] = useMyState<string | null>(null)
    const [curProcess, setCurProcess] = useState<CurrentProcessInternal | null>(null)

    const detachProcess = useCallback(() => {
        setCurProcess(null)
    }, [])

    const handleProcessOutput = useCallback((out: ProcessOutput) => {
        switch (out.type) {
            case "regular": {
                setOutput(out.text)
                break
            }
            case "error": {
                setOutput("ERROR: " + out.text)
                break
            }
            case "exit": {
                props.onExit({cmd: curProcess.cmd, exitStatus: out.status})
                detachProcess()
                break
            }
        }
    }, [detachProcess, curProcess, setOutput, props])

    const startProcess = useCallback((cmd: string) => {
        const launcher = props.launchers.find(f => f.cmd === cmd)
        if (!launcher) {
            props.onStartFailed(cmd)
            return
        }

        setCurProcess({
            cmd,
            process: launcher.launch({setOutput: handleProcessOutput})
        })
    }, [props, handleProcessOutput])

    const cancelProcess = () => {
        curProcess.process.cancel()
        detachProcess()
    }

    if (curProcess === null) {
        return { state: "none", startProcess }
    }

    return {
        state: "active",
        cmd: curProcess.cmd,
        output,
        handleInput: curProcess.process.onInput,
        cancel: cancelProcess
    }
}

type CurrentProcessInternal = {
    cmd: string,
    process: Process,
}