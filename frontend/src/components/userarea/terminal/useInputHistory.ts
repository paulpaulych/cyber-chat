import {useCallback, useEffect, useState} from "react";
import {useKeyListener} from "./useKeyListener";

const HISTORY_DISABLED_POS = -1

export function useInputHistory(props: {
    trigger: number
    newSubmittedInput: string | null
    setInputFromHistory: (text: string) => void
    dropInputFromHistory: () => void
}) {

    const [offset, setOffset] = useState(HISTORY_DISABLED_POS)
    const [history, setHistory] = useState<string[]>([])

    useEffect(() => {
        if (!props.newSubmittedInput) return

        // todo: not to insert element which is duplicate of previous
        setHistory(prev => [props.newSubmittedInput].concat(prev))
        setOffset(HISTORY_DISABLED_POS)

        // because history is updated only by trigger:
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.trigger])

    const shiftUp = useCallback((_) => {
        if (offset >= history.length - 1) {
            console.log("HISTORY TOP")
            return
        }

        const newPos = offset + 1
        setOffset(newPos)
        props.setInputFromHistory(history[newPos])

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [offset, history, props.setInputFromHistory])

    const shiftDown = useCallback((_) => {
        if (offset <= HISTORY_DISABLED_POS) {
            console.log("HISTORY BOTTOM")
            return
        }

        const newPos = offset - 1
        setOffset(newPos)

        if (offset === HISTORY_DISABLED_POS + 1) {
            console.log("DISABLING HISTORY")
            props.dropInputFromHistory()
            return
        }

        props.setInputFromHistory(history[newPos])

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [offset, history, props.setInputFromHistory, props.dropInputFromHistory])

    useKeyListener({
        keySelector: e => e.key === "ArrowUp",
        onPress: shiftUp
    })

    useKeyListener({
        keySelector: e => e.key === "ArrowDown",
        onPress: shiftDown
    })
}
