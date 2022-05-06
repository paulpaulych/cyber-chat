import React, {useEffect, useState} from "react";
import {ok, err, Res, okOrNull, errOrNull, onOk} from "../utils/Res";
import {mapNullable} from "../utils/func";

export type LocalMedia = {
    stream: MediaStream | null,
    error: string | null
}

export const LocalMediaContext = React.createContext<LocalMedia>(null)

export function LocalMediaProvider(props: {
    type: "userMedia" | "displayMedia",
    constraints: MediaStreamConstraints | undefined,
    children
}) {
    const media = useLocalMedia(props)

    return (
        <LocalMediaContext.Provider value={media}>
            {props.children}
        </LocalMediaContext.Provider>
    )
}

function useLocalMedia(props: {
    type: "userMedia" | "displayMedia"
    constraints: MediaStreamConstraints | undefined
}): LocalMedia {
    const [streamRes, setStreamRes] = useState<Res<MediaStream, string> | null>(null);

    useEffect(() => {
        if (streamRes) return

        let didCancel = false

        console.log("getting user media...")

        const media = (props.type === "userMedia")
            ? navigator.mediaDevices.getUserMedia(props.constraints)
            : navigator.mediaDevices.getDisplayMedia(props.constraints)

        media
            .then(stream => {
                if (!didCancel) { setStreamRes(ok(stream))}
            })
            .catch(e => {
                if (!didCancel) { setStreamRes(err(`error connecting to ${props.type}: ${e}`)) }
            })

        return () => {
            didCancel = true
            streamRes && onOk(streamRes, stop)
        };
    }, [props, streamRes]);

    return {
        stream: mapNullable(streamRes, okOrNull),
        error: mapNullable(streamRes, errOrNull),
    }
}

const stop = (stream: MediaStream | null) => {
    if(!stream) return

    stream.getTracks().map(track => track.stop());
}
