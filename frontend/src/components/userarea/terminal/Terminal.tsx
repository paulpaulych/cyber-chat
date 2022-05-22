import "./Terminal.css"
import {useCallback, useEffect, useState} from "react";
import {LaunchProcess} from "./process-api";
import {useCommandShell} from "./useCommandShell";
import {Input, TerminalInput} from "./Input";

const USER: string = "user"

export function Terminal(props: {
    launchers: { cmd: string, launch: LaunchProcess }[]
}) {
    const shell = useCommandShell(props.launchers)

    const [records, addRecord] = useRecords()

    const addEcho = (text: string) => addRecord({type:"echo", text})
    const addOutput = (text: string) => addRecord({type:"output", text})

    const onInput = (input: TerminalInput) => {
        if (input.type === "text") {
            addEcho(input.value)
            shell.onInput(input)
        }
    }

    useEffect(() => {
        if (!shell.output) return

        addOutput(shell.output)

        // because output is updated only by trigger:
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shell.updateTrigger])

    return (
        <div className="Terminal">
            {records.map(renderRecord)}
            <CmdPrelude user={USER}/>
            <Input onSubmit={onInput}/>
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
