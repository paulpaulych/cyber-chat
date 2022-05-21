import {useCallback, useState} from "react";


export type Trigger = number
export type UpdateTrigger = () => void

export function useTrigger(): [number, UpdateTrigger] {
    const [value, setValue] = useState(0)

    const doUpdate = useCallback(() => {
        setValue(prev => prev + 1)
    }, [])

    return [value, doUpdate]
}