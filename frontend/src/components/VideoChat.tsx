import {SystemLog} from "./systemarea/SystemLog";
import {useSignalServer} from "../core/webrtc/useSignalServer";
import {useRtcPeerConnection} from "../core/webrtc/useRtcPeerConnection";
import "./VideoChat.css"
import {UserArea} from "./userarea/UserArea";

export type Mode = "send" | "recv"

export function VideoChat(props: { mode: Mode }) {
    const role = props.mode === "send" ? "sender" : "receiver"
    const url = "ws://localhost:8080/webrtc/room/main/" + role
    const server = useSignalServer(url)
    const conn = useRtcPeerConnection()

    const Loading = () => <h1>Loading...</h1>

    return (
        <>
        {conn &&
            <div className="Chat">
                <div className="ChatUserArea">
                    <UserArea mode={props.mode} server={server} conn={conn}/>
                </div>
                <div className="ChatSystemArea">
                    <SystemLog connStatus={conn.status} signalServer={server}/>
                </div>
            </div>
        }
        {!conn && <Loading/>}
        </>
    )
}
