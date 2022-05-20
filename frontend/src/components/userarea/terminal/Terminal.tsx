import "./Terminal.css"
import {
    useState,
    useEffect,
    FormEvent,
    ChangeEvent,
    SyntheticEvent
} from "react";
import {LaunchProcess} from "./process-api";
import {useProcessManager} from "./useProcessManager";

type Item =
    | { type: "input", text: string }
    | { type: "output", text: string }

export function SystemTerminal(props: {
    launchers: { cmd: string, launch: LaunchProcess }[]
}) {

    // TODO: maybe there's another way to re-render on empty input submit
    const [trigger, setTrigger] = useState(0)

    const triggerRerender = () => {
        setTrigger(prev => prev + 1)
    }

    const [output, onInput] = useProcessManager(props.launchers, triggerRerender)

    return <Terminal trigger={trigger} output={output} onInput={onInput}/>
}

export function Terminal(props: {
    trigger: number,
    output: string | null,
    onInput: (text: string) => void
}) {

    const [items, setItems] = useState<Item[]>([])

    const addOutput = (text) => setItems((prev) => prev.concat([{ type: "output", text}]))

    useEffect(() => {
        if (!props.output) return
        addOutput(props.output)
    }, [props.trigger])

    return (
        <div className="Terminal">
            {items.map(renderItem)}
            <Input onInput={props.onInput}/>
        </div>
    )
}

function renderItem(item: Item, i) {
    switch (item.type) {
        case "input": return <li key={i}>
            <span className="UserInput">{item.text}</span>
            <br/>
        </li>
        case "output": return <li key={i}>
            <span className="Msg">{item.text}</span>
            <br/>
        </li>
    }
}

const Input = (props: {
    onInput: (text: string) => void
}) => {
    const [input, setInput] = useState("")
    const [cursorFlashEnabled, setCursorFlashEnabled] = useState(false)
    const [cursorPos, setCursorPos] = useState(0)

    const submit = (e: FormEvent) => {
        e.preventDefault()
        props.onInput(input)
        setInput("")
    }

    useEffect(() => {
        setTimeout(() => {
            setCursorFlashEnabled(prev => !prev)
        }, 500)
    }, [cursorFlashEnabled])

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        console.log("change " + e.target.selectionStart)
        setInput(e.target.value)
        setCursorPos(e.target.selectionStart)
    }

    const onSelect = (e: SyntheticEvent<HTMLInputElement>) => {
        console.log("change " + e.currentTarget.selectionStart)
        setCursorPos(e.currentTarget.selectionStart)
    }

    const showInputValue = cursorFlashEnabled
        ? input.substring(0, cursorPos) + "█" + input.substring(cursorPos + 1)
        : input

    const invisibleInput = (
        <form className="TerminalInputForm" onSubmit={submit}>
            <input
                autoFocus
                onBlur={e => e.target.focus()}
                className="AbsoluteLeftTop TerminalInput bold"
                type="text"
                value={input}
                onChange={onChange}
                onSelect={onSelect}
            />
        </form>
    )
    return (
        <>
            <span className="bold">jack@videochat:~$ </span>
            <label className="TerminalInputView">{showInputValue}</label>
            {invisibleInput}
            <br/>
        </>
    )
}