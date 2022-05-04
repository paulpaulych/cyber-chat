import {webSocketServer} from "./websocket";

export type IncomingSignal =
    | { type: "Offer", sdp: string }
    | { type: "Answer", sdp: string }

export type OutcomingSignal =
    | { type: "Offer", sdp: string }
    | { type: "Answer", sdp: string }

export type SendSignal = (signal: OutcomingSignal) => void

export function signalServer(
    url: string,
    onSignal: (signal: IncomingSignal) => void
): SendSignal {
    const ws = webSocketServer<OutcomingSignal, IncomingSignal>(url)
    ws.subscribe(onSignal)
    return ws.send
}
