import {useEffect, useState} from "react";

export function useFlashingCursor(p: {
    cursorPos: number,
    text: string
}): string {
    const [cursorFlashEnabled, setCursorFlashEnabled] = useState(false)

    useEffect(() => {
        setTimeout(() => {
            setCursorFlashEnabled(prev => !prev)
        }, 500)
    }, [cursorFlashEnabled])

    return cursorFlashEnabled
        ? p.text.substring(0, p.cursorPos) + "█" + p.text.substring(p.cursorPos + 1)
        : p.text
}
