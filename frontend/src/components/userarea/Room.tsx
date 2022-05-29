import {Mode} from "../CyberChat";
import {SignalServer, useSignalServer} from "../../core/webrtc/useSignalServer";
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
    const url = `ws://localhost:8080/webrtc/room/${props.id}/` + role

    const server = useSignalServer(url)

    useLoggingOf(server)

    return (<div>
        <h3>ROOM (id={props.id.value})</h3>
        { props.streamActive && server &&
            <VideoStreaming mode={props.mode} server={server}/>
        }
    </div>)
}

function useLoggingOf(server: SignalServer) {
    const log = useContext(LogContext)

    useEffect(() => {
        if (!!server) {
            log.setRoomServer(server)
        }
    }, [log, server])
}