import React from "react";
import useWebSocket, {ReadyState} from "react-use-websocket";

export type Signal =
    | { type: "Offer", sdp: string }
    | { type: "Answer", sdp: string }
    | { type: "IceCandidate", candidate: string }

export type InSignal =
    | InError
    | { type: "Offer", sdp: string }
    | { type: "Answer", sdp: string }
    | { type: "IceCandidate", candidate: string }
    | { type: "PeerConnected" }
    | { type: "PeerDisconnected" }

export type InError = { type: "Error", code: "ALREADY_CONNECTED" | "PEER_NOT_CONNECTED" }

export type SignalServer = {
    lastSignal: InSignal,
    sendSignal: (s: Signal) => void,
    readyState: ReadyState
}

export function useSignalServer(url: string): SignalServer {
    const ws = useWebSocket(url, {
        share: true
    });

    return {
        lastSignal: ws.lastJsonMessage,
        sendSignal: ws.sendJsonMessage,
        readyState: ws.readyState
    }
}