import React, {useContext, useState} from "react";
import {SignalServer, SignalServerContext} from "../webrtc/SignalServer";
import {LocalMediaContext, LocalMediaProvider} from "./LocalMedia";
import {useRemoteMedia, useMediaSending} from "../webrtc/webrtc";
import {Player} from "./Player";
import {RtcConnContext} from "../webrtc/WebRtcConn";

enum Mode {
    SEND,
    RECV
}

export function VideoChat() {

    const [mode, setMode] = useState<Mode | null>(null)

    return (
        <div>
            <h3>Connected to signal server</h3>
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

function SendVideo({server}: { server: SignalServer }) {
    console.log("rendering send video. " + `server: ${JSON.stringify(server)}`)

    const localMedia = useContext(LocalMediaContext)
    const conn = useContext(RtcConnContext)

    const {ready, error} = useMediaSending(server, conn, localMedia.stream)

    return (
        <div>
            <h2>SendingVideo</h2>
            {localMedia.stream && <Player stream={localMedia.stream}></Player>}
            {localMedia.error && <h3>LOCAL MEDIA ERROR: {localMedia.error}</h3>}
            {ready && <h3>Streaming started...</h3>}
            {error && <h3>WEBRTC ERROR: {error}</h3>}
        </div>
    );
}

function RecvVideo({server}: { server: SignalServer }) {
    const conn = useContext(RtcConnContext)

    const {stream, error} = useRemoteMedia(server, conn)

    return (
        <div>
            <h2>ReceivingVideo</h2>
            {stream && <Player stream={stream}></Player>}
            {error && <h3>ERROR: {error}</h3>}
        </div>
    )
}

function Translation(props: { mode: Mode }) {

    const server = useContext(SignalServerContext)

    console.log(`rendering video chat, props=${JSON.stringify(props)}`)
    return (
        <div>
            <h3>Video chat. Mode = {props.mode}</h3>
            {server &&
                <div>
                    {props.mode === Mode.SEND
                        ?   (<LocalMediaProvider type={"displayMedia"} constraints={{video: true, audio: true}}>
                                <SendVideo server={server}/>
                            </LocalMediaProvider>)
                        :   <RecvVideo server={server}/>
                    }
                </div>
            }
        </div>
    )
}
