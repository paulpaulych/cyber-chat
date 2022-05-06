import React from "react";
import {useUserMedia} from "./useUserMedia";
import {Player} from "./Player";

export default function CamVideoPlayer() {
    const [stream, error] = useUserMedia({
        video: true,
        audio: true
    });

    return (
        <div>
            <h3>CamVideoPlayer</h3>
            {stream && <Player stream={stream}></Player>}
            {error && <h2>ERROR: ${JSON.stringify(error)}</h2>}
        </div>
    )
}