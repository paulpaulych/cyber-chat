import {RTCConnStatus} from "../webrtc/useRtcPeerConnection";

export function PeerConnStatusBar({ status }: { status: RTCConnStatus }) {
    return (
        <div>
            <h3>RTCPeerConnection status bar</h3>

            <p>IceConnectionState: ${status.iceConnectionState}</p>
            <p>IceGatheringState: ${status.iceGatheringState}</p>

            <h4>Event Log</h4>
            { status.eventLog.map((m, i) => <li key={i}>{i}. {m}</li>) }
        </div>
    );
}