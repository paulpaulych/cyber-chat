import React, {useState} from "react";
import {SignalServer, useSignalServer} from "../core/webrtc/useSignalServer";
import {useLocalMedia} from "../core/useLocalMedia";
import {Player} from "./Player";
import {ReadyState} from "react-use-websocket";
import {SignalServerStatusBar} from "./SignalServerStatusBar";
import {RTCConn, useRtcPeerConnection} from "../core/webrtc/useRtcPeerConnection";
import {PeerConnStatusBar} from "./PeerConnStatusBar";
import {useSenderNegotiation} from "../core/webrtc/useSenderNegotiation";
import {useReceiverNegotiation} from "../core/webrtc/useReceiverNegotiation";

enum Mode {
    SEND,
    RECV
}

export function VideoChat() {

    const [mode, setMode] = useState<Mode | null>(null)

    return (
        <div>
            {mode === null
                ?
                <div>
                    <label>CHOOSE YOUR MODE</label>
                    <button onClick={() => setMode(Mode.SEND)}>SEND</button>
                    <button onClick={() => setMode(Mode.RECV)}>RECV</button>
                </div>
                : <Translation mode={mode}/>
            }
        </div>
    );
}

function SendVideo({server, conn}: { conn: RTCConn, server: SignalServer }) {
    const constraints = {
        video: { width: 640, height: 480 },
        audio: true
    }

    const localMedia = useLocalMedia ({ type: "displayMedia", constraints})

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

function Translation(props: { mode: Mode }) {
    const role = props.mode === Mode.SEND ? "sender" : "receiver"
    const url = "ws://localhost:8080/webrtc/room/main/" + role
    const server = useSignalServer(url)
    const conn = useRtcPeerConnection()

    return (
        <div>
            <SignalServerStatusBar server={server}/>
            { conn &&
                <div>
                    <PeerConnStatusBar status={conn.status}/>
                    <h3>Video chat. Role = {role}</h3>
                    {server.readyState === ReadyState.OPEN &&
                        <div>
                            {props.mode === Mode.SEND
                                ?   <SendVideo conn={conn} server={server}/>
                                :   <RecvVideo conn={conn} server={server}/>
                            }
                        </div>
                    }
                </div>
            }
        </div>
    )
}
