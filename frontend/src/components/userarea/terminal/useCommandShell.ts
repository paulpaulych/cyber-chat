import {ProcessFactory} from "./api/process-api";
import {useCallback} from "react";
import {ProcessExit, useCurrentProcess} from "./useCurrentProcess";
import {NEW_LINE, Printable} from "./api/system-call";

export type CmdShell =
    | {
    state: "waiting-for-cmd"
    runCmd: (text: string) => void
} | {
    state: "cmd-running",
    handleInput: (text: string) => void
    interrupt: () => void
}

export function useCommandShell({onPrint, processFactory}: {
    processFactory: ProcessFactory,
    onPrint: (o: Printable[]) => void
}): CmdShell {
    const onExit = useCallback((exit: ProcessExit) => {
        const {cmd, exitStatus} = exit
        switch (exitStatus.code) {
            case "ok":
                return
            case "err":
                return onPrint([NEW_LINE, `${cmd} exited with error: ${exitStatus.error}`])
        }
    }, [onPrint])

    const process = useCurrentProcess({processFactory, onExit, onPrint})

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
