import React, {useCallback} from "react";

export function Player(props: { stream: MediaStream }) {
    const play = (video: HTMLVideoElement | null) => {
        if (!video) return

        video.srcObject = props.stream
        video.play()
            .catch((e) => {
                console.log("failed to play video: " + e.message)
            })
    }

    return (
        <div>
            <h3>VIDEO PLAYER</h3>
            <video ref={play}></video>
        </div>
    )
}