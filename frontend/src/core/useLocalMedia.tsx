import {useEffect, useState} from "react";

export type UseLocalMedia = {
    stream: MediaStream | null,
    error: string | null
}

export function useLocalMedia(props: {
    type: "userMedia" | "displayMedia"
    constraints: MediaStreamConstraints | undefined
}): UseLocalMedia {
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [asked, setAsked] = useState(false)

    useEffect(() => {
        if (stream) return
        if (error) return
        if (asked) return

        console.log("getting user media...")

        const media = (props.type === "userMedia")
            ? navigator.mediaDevices.getUserMedia(props.constraints)
            : navigator.mediaDevices.getDisplayMedia(props.constraints)

        setAsked(true)

        media
            .then(stream => {
                setStream(stream)
            })
            .catch(e => {
                setError(`error connecting to ${props.type}: ${e}`)
            })
    }, [props, stream, error, asked]);

    const res = { stream, error }
    console.log("rendered useLocalMedia: " + JSON.stringify(res))
    return res
}

const stop = (stream: MediaStream | null) => {
    if(!stream) return

    stream.getTracks().map(track => track.stop());
}
