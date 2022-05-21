import {LaunchProcess, ProcessOutput} from "./process-api";
import {useCallback, useMemo, useState} from "react";
import {Trigger, useTrigger} from "./useTrigger";

export type CmdShell = {
    output: string | null,
    onInput: (input: CmdShellInput) => void,
    updateTrigger: Trigger
}

export type CmdShellInput =
    | { type: "text", value: string }
    | { type: "ctrl+c" }

export function useCommandShell(
    launchers: { cmd: string, launch: LaunchProcess }[],
): CmdShell {
    const [output, setOutput] = useState<string | null>(null)

    const [currentProcess, setCurrentProcess] = useState<CurrentProcess | null>(null)

    const [trigger, updateTrigger] = useTrigger()

    const write = useCallback((out: string) => {
        setOutput(out)
        updateTrigger()
    }, [updateTrigger])

    const startProcess = useCallback((cmd: string) => {
        const launcher = launchers.find(f => f.cmd === cmd)
        if (!launcher) {
            write("unknown command " + cmd)
            return
        }

        const process = { cmd,
            onInput: launcher.launch({
                setOutput: (out) => {
                    handleProcessOutput({
                        out,
                        cmd: launcher.cmd,
                        write,
                        dropProcess: () => setCurrentProcess(null)
                    })
                }
            })
        }

        if (process) {
            setCurrentProcess(process)
            write(`${process.cmd} started`)
        }
    }, [launchers, write])

    const onInput = useMemo(() => {
        if (!currentProcess) {
            return (input: CmdShellInput) => {
                if (input.type === "text") {
                    startProcess(input.value)
                    return
                }
            }
        }
        return (input: CmdShellInput) => {
            if (input.type === "text") {
                currentProcess.onInput(input.value)
                return
            } else if (input.type === "ctrl+c") {
                // todo:  terminate process
            }
        }
    }, [currentProcess, startProcess])

    return { output, onInput, updateTrigger: trigger}
}

type CurrentProcess = {
    cmd: string,
    onInput: (input: string) => void,
}

function handleProcessOutput({cmd, out, dropProcess, write}: {
    cmd: string,
    out: ProcessOutput,
    dropProcess: () => void,
    write: (text: string) => void,
}) {
    switch (out.type) {
        case "regular": {
            write(`${cmd}: ${out.text}`)
            break
        }
        case "error": {
            write(`${cmd} error: ${out.text}"`)
            break
        }
        case "exit": {
            if (out.status.code === "ok") {
                write(`${cmd} finished"`)
            } else {
                write(`${cmd} exited with error: ${out.status.error}`)
            }
            dropProcess()
            break
        }
    }
}