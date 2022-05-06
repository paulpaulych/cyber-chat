import {useEffect, useState} from "react";
import WebSocket from "isomorphic-ws";

export type IncomingSignal =
    | { type: "Offer", sdp: string }
    | { type: "Answer", sdp: string }

export function useIncomingSignal(ws: WebSocket) {
    const [signal, setSignal] = useState<IncomingSignal | null>(null)

    ws.onmessage = (msg) => {
        setSignal(JSON.parse(msg.data as string))
    }

    return signal
}
