import React from "react";
import {useUserMedia} from "./useUserMedia";

export default function CamVideo() {

    const { stream, error } = useUserMedia({
        video: true,
        audio: true
    });

    const play = async (video: HTMLVideoElement | null) => {
        if(!video) return

        video.srcObject = stream
        await video.play()
    }

    return (
        <div className="Video">
            {stream && <video ref={play}></video>}
            {error && <h2>ERROR: ${JSON.stringify(error)}</h2>}
        </div>
    )
}