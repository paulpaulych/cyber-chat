import React, {useEffect, useState} from "react";
import WebSocket from "isomorphic-ws";

export type Signal =
    | { type: "Offer", sdp: string }
    | { type: "Answer", sdp: string }

export type SignalServer = {
    sendSignal: (s: Signal) => void
    subscribe: (cb: (s: WebSocket.MessageEvent) => void) => void
    unsubscribe: (cb: (s: WebSocket.MessageEvent) => void) => void
}

export const SignalServerContext = React.createContext<SignalServer>(null)

export const SignalServerProvider = (props: {
    url: string,
    children
}) => {
    const [ws, setWs] = useState<WebSocket>(connect(props.url))

    useEffect(() => {
        const onClose = () => {
            console.log("connection closed")
            setWs(new WebSocket(props.url))
        }

        ws.addEventListener("close", onClose)

        return () => {
            ws.removeEventListener("close", onClose)
        }
    }, [ws])

    useEffect(() => {
        return () => {
            console.log("closing connection")
            ws.close()
        }
    }, [props.url])

    const signalServer: SignalServer = {
        sendSignal: (s) => ws.send(JSON.stringify(s)),
        subscribe: (listener) => ws.addEventListener("message", listener),
        unsubscribe: (listener) => ws.removeEventListener("message", listener),
    }

    return (
        <SignalServerContext.Provider value={signalServer}>
            {props.children}
        </SignalServerContext.Provider>
    )
}

const connect = (url: string) => {
    const ws = new WebSocket(url)
    ws.onopen = () => {
        console.log("connected")
    }
    return ws
}