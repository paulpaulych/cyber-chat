import {Dispatch, SetStateAction, useCallback, useMemo, useState} from "react";
import {Trigger, useTrigger} from "./useTrigger";

export type MyState<T> = {
    readonly trigger: Trigger,
    readonly value: T
}

/**
 * state which updates causes updates of its deps event when value is the same
 * TODO: rename
 */
export function useMyState<T>(initial: T): [MyState<T>, Dispatch<SetStateAction<T>>] {
    const [trigger, updateTrigger] = useTrigger()
    const [value, setValue] = useState(initial)

    const myState = useMemo(() => ({ trigger, value }), [trigger])

    const setMyState = useCallback((act: SetStateAction<T>) => {
        setValue(act)
        updateTrigger()
    }, [])

    return [myState, setMyState]
}