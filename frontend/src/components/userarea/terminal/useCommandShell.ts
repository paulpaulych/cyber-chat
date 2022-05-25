import {LaunchProcess, NEW_LINE, Printable} from "./process-api";
import {useCallback} from "react";
import {ProcessExit, useCurrentProcess} from "./useCurrentProcess";

export type CmdShell =
    | {
    state: "waiting-for-cmd"
    runCmd: (text: string) => void
} | {
    state: "cmd-running",
    handleInput: (text: string) => void
    interrupt: () => void
}

export function useCommandShell({onPrint, launchers}: {
    launchers: { cmd: string, launch: LaunchProcess }[],
    onPrint: (o: Printable[]) => void
}): CmdShell {
    const onStartFailed = useCallback((cmd: string) => {
        onPrint(["unknown command: " + cmd, NEW_LINE])
    }, [onPrint])

    const onExit = useCallback((exit: ProcessExit) => {
        const {cmd, exitStatus} = exit
        switch (exitStatus.code) {
            case "ok":
                return onPrint([NEW_LINE, `${cmd} finished`, NEW_LINE])
            case "err":
                return onPrint([NEW_LINE, `${cmd} exited with error: ${exitStatus.error}`])
        }
    }, [onPrint])

    const process = useCurrentProcess({launchers, onStartFailed, onExit, onPrint})

    switch (process.state) {
        case "none":
            return {
                state: "waiting-for-cmd",
                runCmd: process.startProcess,
            }
        case "active":
            return {
                state: "cmd-running",
                interrupt: process.interrupt,
                handleInput: process.handleInput
            }
    }
}
