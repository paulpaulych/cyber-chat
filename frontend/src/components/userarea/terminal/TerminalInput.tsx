import "./Terminal.css"
import {ChangeEvent, FormEvent, SyntheticEvent, useCallback, useEffect, useState} from "react";
import {useKeyListener} from "./useKeyListener";
import {useInputHistory} from "./useInputHistory";
import {useFlashingCursor} from "./useFlashingCursor";
import {useTrigger} from "./useTrigger";

export type TerminalInputValue =
    | { type: "text", value: string }
    | { type: "cancel" }

export function TerminalInput({onSubmit}: {
    onSubmit: (input: TerminalInputValue) => void
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

    const onCursorPosChanged = (e: SyntheticEvent<HTMLInputElement>) => {
        setCursorPos(e.currentTarget.selectionStart)
    }

    const cancelTrigger = useCancelTrigger()
    useEffect(() => {onSubmit({ type: "cancel" })}, [cancelTrigger, onSubmit])

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

function useCancelTrigger() {
    const [cancelTrigger, updateCancelTrigger] = useTrigger()
    const ctrlC = useCallback(e => e.ctrlKey && e.key === "c", [])
    useKeyListener({keySelector: ctrlC, onPress: updateCancelTrigger})
    return cancelTrigger
}

function calcActualInput(p: { typedInput, history }) {
    return p.history.value !== null ? p.history.value : p.typedInput
}