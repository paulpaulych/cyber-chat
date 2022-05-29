import React from "react";
import {SignalServer} from "../../core/webrtc/useSignalServer";
import {useLocalMedia} from "../../core/useLocalMedia";
import {Player} from "./Player";
import {RTCConn} from "../../core/webrtc/useRtcPeerConnection";
import {useSenderNegotiation} from "../../core/webrtc/useSenderNegotiation";
import {useReceiverNegotiation} from "../../core/webrtc/useReceiverNegotiation";

export const VideoStreaming = (props: {
    mode: "send" | "recv",
    server: SignalServer,
    conn: RTCConn
}) => props.mode === "send"
    ? <SendVideo conn={props.conn} server={props.server}/>
    : <RecvVideo conn={props.conn} server={props.server}/>

function SendVideo({server, conn}: { conn: RTCConn, server: SignalServer }) {
    const constraints = {
        video: { width: 640, height: 480 },
        audio: true
    }

    const localMedia = useLocalMedia ({ type: "displayMedia", constraints })

    const {ready, error} = useSenderNegotiation(server, conn, localMedia.stream)

    return (
        <div>
            <h2>SendingVideo</h2>
            {localMedia.error && <h3>LOCAL MEDIA ERROR: {localMedia.error}</h3>}
            {ready && <h3>Streaming started...</h3>}
            {error && <h3>ERR: negotiation error: {error}</h3>}
        </div>
    );
}

function RecvVideo({server, conn}: { conn: RTCConn, server: SignalServer }) {
    const {stream, error} = useReceiverNegotiation(server, conn)

    return (
        <div>
            <h2>ReceivingVideo</h2>
            {stream && <Player stream={stream}></Player>}
            {error && <h3>ERROR: {error}</h3>}
        </div>
    )
}
