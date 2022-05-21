import "./Terminal.css"
import {ChangeEvent, FormEvent, SyntheticEvent, useCallback, useEffect, useState} from "react";
import {LaunchProcess} from "./process-api";
import {useProcessManager} from "./useProcessManager";
import {useKeyListener} from "./useKeyListener";
import {useInputHistory} from "./useInputHistory";
import {useFlashingCursor} from "./useFlashingCursor";

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

    const addOutput = (text) => setItems((prev) => prev.concat([{type: "output", text}]))

    useEffect(() => {
        if (!props.output) return
        addOutput(props.output)

        // because output is updated only by trigger:
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.trigger])

    const onSubmit = (input: TerminalInput) => {
        if (input.type === "text") {
            props.onInput(input.value)
        }
    }

    return (
        <div className="Terminal">
            {items.map(renderItem)}
            <Input onSubmit={onSubmit}/>
        </div>
    )
}

function renderItem(item: Item, i) {
    switch (item.type) {
        case "input":
            return <li key={i}>
                <span className="UserInput">{item.text}</span>
                <br/>
            </li>
        case "output":
            return <li key={i}>
                <span className="Msg">{item.text}</span>
                <br/>
            </li>
    }
}

type TerminalInput =
    | { type: "text", value: string }
    | { type: "ctrl+c" }

const Input = ({onSubmit}: {
    onSubmit: (input: TerminalInput) => void
}) => {

    const [typedInput, setTypedInput] = useState("")
    const [cursorPos, setCursorPos] = useState(0)

    const history = useInputHistory()

    const submit = useCallback((e: FormEvent) => {
        e.preventDefault()
        const actInput = calcActualInput({ history, typedInput})
        onSubmit({type: "text", value: actInput})
        setTypedInput("")
        history.append(actInput)
    }, [history, typedInput, onSubmit])

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        setTypedInput(e.target.value)
        setCursorPos(e.target.selectionStart)
        history.reset()
    }

    const onSelect = (e: SyntheticEvent<HTMLInputElement>) => {
        setCursorPos(e.currentTarget.selectionStart)
    }

    const ctrlC = useCallback(e => e.ctrlKey && e.key === "c", [])
    const cancel = useCallback(() => onSubmit({type: "ctrl+c"}), [onSubmit])
    useKeyListener({keySelector: ctrlC, onPress: cancel})

    const actualInput = calcActualInput({typedInput, history})

    const invisibleInput = (
        <form className="TerminalInputForm" onSubmit={submit}>
            <input
                autoFocus
                onBlur={e => e.target.focus()}
                className="AbsoluteLeftTop TerminalInput bold"
                type="text"
                value={actualInput}
                onChange={onChange}
                onSelect={onSelect}
            />
        </form>
    )
    return (
        <>
            <span className="bold">jack@videochat:~$ </span>
            <label className="TerminalInputView">{useFlashingCursor({text: actualInput, cursorPos})}</label>
            {invisibleInput}
            <br/>
        </>
    )
}

function calcActualInput(p: { typedInput, history }) {
    return p.history.value !== null ? p.history.value : p.typedInput
}
