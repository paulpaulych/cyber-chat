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

export type RoomServer = {
    lastSignal: InSignal,
    sendSignal: (s: Signal) => void,
    readyState: ReadyState
}

export function useRoomServer(url: string): RoomServer {
    const ws = useWebSocket(url, {
        share: true
    });

    return {
        lastSignal: ws.lastJsonMessage,
        sendSignal: ws.sendJsonMessage,
        readyState: ws.readyState
    }
}