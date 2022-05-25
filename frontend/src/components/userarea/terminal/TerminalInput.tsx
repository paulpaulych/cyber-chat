import "./Terminal.css"
import {ChangeEvent, FormEvent, SyntheticEvent, useCallback, useState} from "react";
import {useKeyListener} from "./useKeyListener";
import {useInputHistory} from "./useInputHistory";
import {useFlashingCursor} from "./useFlashingCursor";

export type TerminalInputValue =
    | { type: "text", value: string }
    | { type: "cancel" }

//TODO: move cursor when using command history
export function TerminalInput({onSubmit}: {
    onSubmit: (input: TerminalInputValue) => void
}) {
    const [typedInput, setTypedInput] = useState<string>("")
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

    const onCursorPosChanged = (e: SyntheticEvent<HTMLInputElement>) => {
        setCursorPos(e.currentTarget.selectionStart)
    }

    useCancelListener(() => onSubmit({ type: "cancel" }))

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
                onSelect={onCursorPosChanged}
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

function useCancelListener(onCancel: () => void) {
    const ctrlC = useCallback(e => e.ctrlKey && e.key === "c", [])
    useKeyListener({keySelector: ctrlC, onPress: onCancel})
}

function calcActualInput(p: { typedInput, history }) {
    return p.history.value !== null ? p.history.value : p.typedInput
}
