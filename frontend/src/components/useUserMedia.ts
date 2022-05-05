import {useEffect, useState} from "react";

export type UserMedia = {
    stream: MediaStream | null
    error: string | null
}

export function useUserMedia(
    constraints: MediaStreamConstraints = {
        audio: true,
        video: true
    }
): UserMedia {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let didCancel = false;

        navigator.mediaDevices.getUserMedia(constraints)
            .then((s) => { if (!didCancel) { setStream(s) } })
            .catch((e) => { if (!didCancel) { setError(e) } })

        return () => {
            didCancel = true
            stop(stream)
        };
    }, [constraints, stream, error]);

    return { stream, error };
}

const stop = (stream: MediaStream | null) => {
    if(!stream) return

    stream.getTracks().map(track => track.stop());
}
