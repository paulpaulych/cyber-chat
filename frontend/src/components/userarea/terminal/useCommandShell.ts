import {LaunchProcess} from "./process-api";
import {useCallback} from "react";
import {ProcessExit, useCurrentProcess} from "./useCurrentProcess";
import {MyState, useMyState} from "./useMyState";

export type CmdShell =
    | {
    state: "waiting-for-cmd"
    output: MyState<string | null>
    runCmd: (text: string) => void
    cancel: () => void
} | {
    state: "cmd-running",
    output: MyState<string | null>
    handleInput: (text: string) => void
    cancel: () => void
}

export function useCommandShell(
    launchers: { cmd: string, launch: LaunchProcess }[],
): CmdShell {
    const [ownOutput, setOwnOutput] = useMyState<string | null>(null)

    const onStartFailed = useCallback((cmd: string) => {
        setOwnOutput("unknown command: " + cmd)
    }, [setOwnOutput])

    const onExit = useCallback((exit: ProcessExit) => {
        const {cmd, exitStatus} = exit
        switch (exitStatus.code) {
            case "ok":
                return setOwnOutput(`${cmd} finished"`)
            case "err":
                return setOwnOutput(`${cmd} exited with error: ${exitStatus.error}`)
        }
    }, [setOwnOutput])

    const process = useCurrentProcess({launchers, onStartFailed, onExit})

    const printCtrlC = useCallback(() => {
        setOwnOutput("^C")
    }, [setOwnOutput])

    switch (process.state) {
        case "none":
            return {
                state: "waiting-for-cmd",
                cancel: printCtrlC,
                output: ownOutput,
                runCmd: process.startProcess,
            }
        case "active":
            return {
                state: "cmd-running",
                cancel: process.cancel,
                output: process.output,
                handleInput: process.handleInput
            }
    }
}
