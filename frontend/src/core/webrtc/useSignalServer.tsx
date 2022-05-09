import useWebSocket, {ReadyState} from "react-use-websocket";

export type Signal =
    | { type: "Offer", sdp: string }
    | { type: "Answer", sdp: string }
    | { type: "IceCandidate", candidate: string }
    | { type: "IceGatheringComplete" }

export type InSignal =
    | InError
    | { type: "Offer", sdp: string }
    | { type: "Answer", sdp: string }
    | { type: "IceCandidate", candidate: string }
    | { type: "IceGatheringComplete" }
    | { type: "PeerConnected" }
    | { type: "PeerDisconnected" }

export type InError = { type: "Error", code: "ALREADY_CONNECTED" | "PEER_NOT_CONNECTED" }

export type UseSignalServer = {
    lastSignal: InSignal,
    sendSignal: (s: Signal) => void,
    readyState: ReadyState
}

export function useSignalServer(url: string): UseSignalServer {
    const ws = useWebSocket(url, {
        share: true
    });

    return {
        lastSignal: ws.lastJsonMessage,
        sendSignal: ws.sendJsonMessage,
        readyState: ws.readyState
    }
}