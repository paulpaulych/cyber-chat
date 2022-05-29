import {VideoTranslation} from "./VideoTranslation";
import {Mode} from "../VideoChat";
import {SignalServer} from "../../core/webrtc/useSignalServer";
import {RTCConn} from "../../core/webrtc/useRtcPeerConnection";
import "./UserArea.css"

export const UserArea = (props: {
    conn: RTCConn
    server: SignalServer
    mode: Mode
}) => {
    return <div className="UserArea">
        <div className="UserAreaVideo">
            <VideoTranslation mode={props.mode} server={props.server} conn={props.conn}/>
        </div>
        <div className="UserAreaTerminal">
            {/*<Terminal/>*/}
        </div>
    </div>
}
