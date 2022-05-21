import "./Terminal.css"
import {ChangeEvent, FormEvent, SyntheticEvent, useCallback, useState} from "react";
import {useKeyListener} from "./useKeyListener";
import {useInputHistory} from "./useInputHistory";
import {useFlashingCursor} from "./useFlashingCursor";

export type TerminalInput =
    | { type: "text", value: string }
    | { type: "ctrl+c" }

export function Input({onSubmit}: {
    onSubmit: (input: TerminalInput) => void
}) {

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
            <label className="TerminalInputView">{useFlashingCursor({text: actualInput, cursorPos})}</label>
            {invisibleInput}
            <br/>
        </>
    )
}

function calcActualInput(p: { typedInput, history }) {
    return p.history.value !== null ? p.history.value : p.typedInput
}
