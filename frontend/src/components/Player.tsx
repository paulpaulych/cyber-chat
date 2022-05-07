import React from "react";

export function Player(props: { stream: MediaStream }) {
    const play = async (video: HTMLVideoElement | null) => {
        if (!video) return

        video.srcObject = props.stream
        await video.play()
    }

    return (<video ref={play}></video>)
}