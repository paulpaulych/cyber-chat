import "./Terminal.css"
import {useCallback, useState} from "react";
import {ProcessFactory} from "./api/process-api";
import {useCommandShell} from "./useCommandShell";
import {TerminalInput, TerminalInputValue} from "./TerminalInput";
import {Out, TerminalOutput} from "./renderTerminalOutput";
import {Printable} from "./api/system-call";

const USER: string = "user"

export function Terminal({processFactory}: {
    processFactory: ProcessFactory
}) {
    const [items, setItems] = useState<Out[]>([])

    const appendOutput = useCallback((out: Out[]) => {
        setItems(prev => prev.concat(out))
    }, [setItems])

    const shell = useCommandShell({
        processFactory,
        onPrint: printables => appendOutput(printables.map(toTerminalOutput))
    })

    const addEcho = useCallback((text: string) => {
        appendOutput([
            { type: "prelude", user: USER },
            { type: "text", value: text },
            { type: "br" },
        ])
    }, [appendOutput])

    const addOutput = useCallback((text: string) => {
        appendOutput([{type:"text", value: text}])
    }, [appendOutput])

    const onTextInput = useCallback((input: string) => {
        switch (shell.state) {
            case "cmd-running": {
                addOutput(input)
                shell.handleInput(input)
                return
            }
            case "waiting-for-cmd": {
                addEcho(input)
                shell.runCmd(input)
                return
            }
        }
    }, [shell, addEcho, addOutput])

    const onCancel = useCallback(() => {
        appendOutput([{ type: "text", value: "^C"}])
        switch (shell.state) {
            case "cmd-running": {
                shell.interrupt()
                return
            }
            case "waiting-for-cmd": {
                return
            }
        }
    }, [shell, appendOutput])


    const onInput = useCallback((input: TerminalInputValue) => {
        switch (input.type) {
            case "text": {
                onTextInput(input.value)
                return
            }
            case "cancel": {
                onCancel()
            }
        }
    }, [onTextInput, onCancel])

    return (
        <div className="Terminal">
            <TerminalOutput enablePrelude={shell.state === "waiting-for-cmd"} user={USER} output={items}/>
            <TerminalInput onSubmit={onInput}/>
        </div>
    )
}

function toTerminalOutput(p: Printable): Out {
    if (typeof p === "string") {
        return { type: "text", value: p }
    }
    return { type: "br" }
}
