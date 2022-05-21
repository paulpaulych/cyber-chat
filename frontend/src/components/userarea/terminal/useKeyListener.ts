import {useEffect} from "react";

export function useKeyListener({keySelector, onPress}: {
    keySelector: (e: KeyboardEvent) => boolean
    onPress: (e: KeyboardEvent) => void
}) {
    useEffect(() => {
        const listener = (e: KeyboardEvent) => {
            if (keySelector(e)) {
                onPress(e)
            }
        }

        document.addEventListener("keydown", listener)

        return () => {
            document.removeEventListener("keydown", listener)
        }
    }, [keySelector, onPress])
}