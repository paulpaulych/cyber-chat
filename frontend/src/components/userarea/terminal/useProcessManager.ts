import {LaunchProcess, ProcessOutput} from "./process-api";
import {useCallback, useMemo, useState} from "react";

type CurrentProcess = {
    cmd: string,
    onInput: (input: string) => void,
}

export function useProcessManager(
    launchers: { cmd: string, launch: LaunchProcess }[],
    triggerRerender: () => void
): [string | null, (input: string) => void] {
    const [output, writeOutput] = useState<string | null>(null)

    const [currentProcess, setCurrentProcess] = useState<CurrentProcess | null>(null)

    const startProcess = useCallback((cmd: string) => {
        const writeByRoot = (msg) => {
            writeOutput("ROOT: " + msg)
            triggerRerender()
        }

        const launcher = launchers.find(f => f.cmd === cmd)
        if (!launcher) {
            writeByRoot("unknown process")
            return
        }

        const process = { cmd,
            onInput: launcher.launch({
                setOutput: (out) => {
                    handleProcessOutput({
                        out,
                        cmd: launcher.cmd,
                        writeByRoot,
                        writeOutput,
                        dropProcess: () => setCurrentProcess(null)
                    })
                    triggerRerender()
                }
            })
        }

        if (process) {
            setCurrentProcess(process)
            writeByRoot(`${process.cmd} started`)
        }
    }, [launchers, triggerRerender])

    const onInput = useMemo(() => {
        if (!currentProcess) {
            return startProcess
        }
        return currentProcess.onInput
    }, [currentProcess, startProcess])

    return [output, onInput]
}

function handleProcessOutput({cmd, out, dropProcess, writeOutput, writeByRoot}: {
    cmd: string,
    out: ProcessOutput,
    dropProcess: () => void,
    writeOutput: (text: string) => void,
    writeByRoot: (text: string) => void,
}) {
    switch (out.type) {
        case "regular": {
            writeOutput(`${cmd}: ${out.text}`)
            break
        }
        case "error": {
            writeOutput(`${cmd} error: ${out.text}"`)
            break
        }
        case "exit": {
            if (out.status.code === "ok") {
                writeByRoot(`${cmd} finished"`)
            } else {
                writeByRoot(`${cmd} exited with error: ${out.status.error}`)
            }
            dropProcess()
            break
        }
    }
}