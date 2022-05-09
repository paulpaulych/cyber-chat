import {SystemLog} from "./systemarea/SystemLog";
import {VideoTranslation} from "./userarea/VideoTranslation";
import {Terminal} from "./userarea/terminal/Terminal";
import {useSignalServer} from "../core/webrtc/useSignalServer";
import {useRtcPeerConnection} from "../core/webrtc/useRtcPeerConnection";

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
            <div className="Chat border-wh-5">
                <div className="ChatUserArea border-wh-5">
                    <VideoTranslation mode={props.mode} server={server} conn={conn}/>
                    <Terminal/>
                </div>
                <div className="ChatSystemArea border-wh-5">
                    <SystemLog connStatus={conn.status} signalServer={server}/>
                </div>
            </div>
        }
        {!conn && <Loading/>}
        </>
    )
}
