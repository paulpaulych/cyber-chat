import {useCallback, useState} from "react";
import {useKeyListener} from "./useKeyListener";

const HISTORY_RESET_POS = -1

type InputHistory = {
    append(text: string)
    reset()
    value: string | null
}

export function useInputHistory(): InputHistory {
    const [offset, setOffset] = useState(HISTORY_RESET_POS)
    const [history, setHistory] = useState<string[]>([])

    const reset = useCallback(() => {
        setOffset(HISTORY_RESET_POS)
    }, [])

    const append = useCallback((text) => {
        if (!text) return

        // todo: not to insert element which is duplicate of previous
        setHistory(prev => [text].concat(prev))
        reset()

        // because history is updated only by trigger:
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reset])

    const shiftUp = useCallback((_) => {
        if (offset >= history.length - 1) {
            console.log("HISTORY TOP")
            return
        }

        const newPos = offset + 1
        setOffset(newPos)
    }, [offset, history])

    const shiftDown = useCallback((_) => {
        if (offset <= HISTORY_RESET_POS) {
            console.log("HISTORY BOTTOM")
            return
        }

        if (offset === HISTORY_RESET_POS + 1) {
            reset()
            return;
        }

        const newPos = offset - 1
        setOffset(newPos)
    }, [offset, reset])

    useKeyListener({
        keySelector: e => e.key === "ArrowUp",
        onPress: shiftUp
    })

    useKeyListener({
        keySelector: e => e.key === "ArrowDown",
        onPress: shiftDown
    })

    const value = (offset === HISTORY_RESET_POS)
        ? null
        : history[offset]
        ?? null

    return { value, reset, append }
}
