import {SignalServer} from "../webrtc/SignalServer";
import React, {useEffect, useState} from "react";
import {ReadyState} from "react-use-websocket";

export function SignalServerStatusBar({ server }: { server: SignalServer }) {
    const [messages, setMessages] = useState<string[]>([])

    useEffect(() => {
        if (!server.lastSignal) return

        setMessages((prev) => prev.concat([JSON.stringify(server.lastSignal)]))
    }, [server.lastSignal])

    return (
        <div>
            <h3>ServerStatus: {localizeState(server.readyState)}</h3>
            <h3>Message Log</h3>
            { messages.map((m, i) => <li key={i}>{i}. {m}</li>) }
        </div>
    );
}

const localizeState = (state) => {
    switch (state) {
        case ReadyState.CLOSED: return "CLOSED"
        case ReadyState.CLOSING: return "CLOSING"
        case ReadyState.CONNECTING: return "CONNECTING"
        case ReadyState.OPEN: return "OPEN"
        case ReadyState.UNINSTANTIATED: return "UNINSTANTIATED"
    }
}