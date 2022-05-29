import {Mode} from "../CyberChat";
import {useSignalServer} from "../../core/webrtc/useSignalServer";
import {useRtcPeerConnection} from "../../core/webrtc/useRtcPeerConnection";
import {VideoTranslation} from "./VideoTranslation";
import {useContext, useEffect} from "react";
import {LogContext} from "../log/LogContext";


export function Room(props: {
    id: { value: string }
    mode: Mode
}) {
    const mode: Mode = "send"
    const role = mode === "send" ? "sender" : "receiver"
    const url = "ws://localhost:8080/webrtc/room/main/" + role

    const server = useSignalServer(url)
    const conn = useRtcPeerConnection()

    {
        const log = useContext(LogContext)
        useEffect(() => {
            log.setRoomServer(server)
            log.setPeerConnStatus(conn.status)
        }, [log, server, conn.status])
    }

    return (<div>
        <h3>ROOM (id={props.id.value})</h3>
        <VideoTranslation mode={props.mode} server={server} conn={conn}/>
    </div>)
}