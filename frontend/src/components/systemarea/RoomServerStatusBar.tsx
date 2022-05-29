import {RoomServer} from "../../core/webrtc/useRoomServer";
import React from "react";
import {ReadyState} from "react-use-websocket";

export function RoomServerStatusBar({ server }: { server: RoomServer }) {
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