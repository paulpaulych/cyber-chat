import React, {useEffect, useState} from 'react';
import {useWebsocket} from "./network/websocket";
import WebSocket from "isomorphic-ws";
import {useRemoteStream, useRemoteStreamReceiver} from "./webrtc/webrtc";
import {Player} from "./components/Player";
import {useUserMedia} from "./components/useUserMedia";

enum Mode {
    SEND,
    RECV
}

export default function App() {
    const [mode, setMode] = useState<Mode | null>(null)

    const { ws, error } = useWebsocket("ws://localhost:8080/ws")

    return (
        <div>
            { mode == null
                ?
                <div>
                    <label>CHOOSE YOUR MODE</label>
                    <button onClick={() => setMode(Mode.SEND)}>SEND</button>
                    <button onClick={() => setMode(Mode.RECV)}>RECV</button>
                </div>
                : ws && <VideoChat ws={ws} mode={mode}/>
            }
            { error && <h3>ERROR: {error}</h3> }
        </div>
    );
}

function SendVideo({ ws } : { ws: WebSocket }) {
    const [ stream, userMediaError ] = useUserMedia({
        video: true,
        audio: true
    })

    const webrtcError = useRemoteStreamReceiver(ws, stream)

    return (
        <div>
            <h2>SendVideo</h2>
            { userMediaError && <h3>USER MEDIA ERROR: {userMediaError}</h3> }
            { webrtcError && <h3>WEBRTC ERROR: {webrtcError}</h3> }
        </div>
    );
}

function RecvVideo({ ws }: { ws: WebSocket }) {
    const { stream, error } = useRemoteStream(ws)

    return (
        <div>
            <h2>RecvVideo</h2>
            { stream && <Player stream={stream}></Player> }
            { error && <h3>ERROR: {error}</h3> }
        </div>
    )
}

function VideoChat(props: {
    mode: Mode,
    ws: WebSocket
}) {
    return (
        <div>
            <h3>Video chat. Mode = {props.mode}</h3>
            { props.ws &&
                <div>
                    {   props.mode === Mode.SEND
                        ? <SendVideo ws={props.ws}/>
                        : <RecvVideo ws={props.ws}/>
                    }
                </div>
            }
        </div>
    )
}
