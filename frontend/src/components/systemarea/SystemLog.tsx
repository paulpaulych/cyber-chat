import {PeerConnStatusBar} from "./PeerConnStatusBar";
import {SignalServerStatusBar} from "./SignalServerStatusBar";
import {RTCConnStatus} from "../../core/webrtc/useRtcPeerConnection";
import {SignalServer} from "../../core/webrtc/useSignalServer";

export function SystemLog(props: {
    connStatus: RTCConnStatus,
    signalServer: SignalServer
}) {
    return (
        <div>
            <PeerConnStatusBar status={props.connStatus}/>
            <SignalServerStatusBar server={props.signalServer}/>
        </div>
    );
}