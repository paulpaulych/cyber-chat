import {UseSignalServer} from "../core/webrtc/useSignalServer";
import React from "react";
import {ReadyState} from "react-use-websocket";

export function SignalServerStatusBar({ server }: { server: UseSignalServer }) {
    return (
        <div>
            <h3>ServerStatus: {localizeState(server.readyState)}</h3>
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