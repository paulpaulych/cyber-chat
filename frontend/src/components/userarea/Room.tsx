import {Mode} from "../CyberChat";
import {SignalServer, useSignalServer} from "../../core/webrtc/useSignalServer";
import {RTCConn, useRtcPeerConnection} from "../../core/webrtc/useRtcPeerConnection";
import {VideoStreaming} from "./VideoStreaming";
import {useContext, useEffect} from "react";
import {LogContext} from "../log/LogContext";


export function Room(props: {
    id: { value: string }
    mode: Mode,
    streamActive: boolean
}) {

    const mode: Mode = "send"
    const role = mode === "send" ? "sender" : "receiver"
    const url = "ws://localhost:8080/webrtc/room/main/" + role

    const server = useSignalServer(url)
    const conn = useRtcPeerConnection()

    useLoggingOf(server, conn)

    return (<div>
        <h3>ROOM (id={props.id.value})</h3>
        { props.streamActive && conn && server &&
            <VideoStreaming mode={props.mode} server={server} conn={conn}/>
        }
    </div>)
}

function useLoggingOf(server: SignalServer, conn: RTCConn) {
    const log = useContext(LogContext)

    useEffect(() => {
        if (!!server) {
            log.setRoomServer(server)
        }
        if (!!conn) {
            log.setPeerConnStatus(conn.status)
        }
    }, [log, server, conn])
}