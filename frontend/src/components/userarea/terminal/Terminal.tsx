import "./Terminal.css"
import {useCallback, useEffect, useState} from "react";
import {LaunchProcess} from "./process-api";
import {useCommandShell} from "./useCommandShell";
import {TerminalInput, TerminalInputValue} from "./TerminalInput";

const USER: string = "user"

export function Terminal(props: {
    launchers: { cmd: string, launch: LaunchProcess }[]
}) {
    const shell = useCommandShell(props.launchers)

    const [records, addRecord] = useRecords()

    const addEcho = useCallback((text: string) => addRecord({type:"echo", text}), [addRecord])
    const addOutput = useCallback((text: string) => addRecord({type:"output", text}), [addRecord])

    const onInput = useCallback((input: TerminalInputValue) => {
        if (input.type === "cancel") {
            shell.cancel()
            return
        }

        switch (shell.state) {
            case "cmd-running": {
                shell.handleInput(input.value)
                return
            }
            case "waiting-for-cmd": {
                addEcho(input.value)
                shell.runCmd(input.value)
                return
            }
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shell.state, addEcho])

    useEffect(() => {
        if (!shell.output.value) return

        addOutput(shell.output.value)

        // because output is updated only by trigger:
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shell.output, addOutput])

    return (
        <div className="Terminal">
            {records.map(renderRecord)}
            {shell.state === "waiting-for-cmd" && <CmdPrelude user={USER}/>}
            <TerminalInput onSubmit={onInput}/>
        </div>
    )
}

function useRecords(): [Record[], (Record) => void] {
    const [records, setRecords] = useState<Record[]>([])

    const addRecord = useCallback((record: Record) => {
        setRecords(prev => prev.concat([record]))
    }, [])

    return [records, addRecord]
}

function CmdPrelude(props: { user: string }) {
    return (<span className="bold">{props.user}@cyberchat:~$ </span>)
}

type Record =
    | { type: "output", text: string }
    | { type: "echo", text: string }

function renderRecord(item: Record, i: number) {
    switch (item.type) {
        case "echo":
            return <div key={i}>
                <CmdPrelude user={USER}/>
                <span className="UserInput">{item.text}</span>
                <br/>
            </div>
        case "output":
            return <div key={i}>
                <span className="Msg">{item.text}</span>
                <br/>
            </div>
    }
}
