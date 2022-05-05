import {WebSocketServer, webSocketServer} from "../network/websocket";

export type IncomingSignal =
    | { type: "Offer", sdp: string }
    | { type: "Answer", sdp: string }

export type OutcomingSignal =
    | { type: "Offer", sdp: string }
    | { type: "Answer", sdp: string }

export type SignalServer = WebSocketServer<OutcomingSignal, IncomingSignal>;

export function runSignalServer(
    url: string,
): SignalServer {
    return webSocketServer<OutcomingSignal, IncomingSignal>(url)
}
