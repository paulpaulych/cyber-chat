import {RTCConnStatus} from "../../core/webrtc/useRtcPeerConnection";

export function PeerConnStatusBar({ status }: { status: RTCConnStatus }) {
    return (
        <div>
            <h3>RTCPeerConnection status bar</h3>

            <li>IceConnectionState: {status.iceConnectionState}</li>
            <li>IceGatheringState: {status.iceGatheringState}</li>
            <li>SignalingState: {status.signalingState}</li>
            <li>Has LocalDescription: {status.hasLocalDescription ? "yes" : "no"}</li>
            <li>Has RemoteDescription: {status.hasRemoteDescription ? "yes" : "no"}</li>
            <h4>Event Log</h4>
            { status.eventLog.map((m, i) => <li key={i}>{i}. {m}</li>) }
        </div>
    );
}