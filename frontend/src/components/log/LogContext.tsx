import {RTCConnStatus} from "../../core/webrtc/useRtcPeerConnection";
import {RoomServer} from "../../core/webrtc/useRoomServer";
import React, {useContext, useMemo, useState} from "react";
import {Auth, AuthContext} from "../auth/AuthContext";

export type LogData = {
    peerConnStatus: RTCConnStatus | null,
    setPeerConnStatus: (RTCConnStatus) => void,

    roomServer: RoomServer | null,
    setRoomServer: (SignalServer) => void,

    auth: Auth | null
}

export const LogContext = React.createContext<LogData>(undefined)

export function LogContextProvider({children}: {children}) {
    const [peerConnStatus, setPeerConnStatus] = useState<RTCConnStatus | null>(null)
    const [roomServer, setRoomServer] = useState<RoomServer| null>(null)

    const auth = useContext(AuthContext)

    const value = useMemo(() => ({
        peerConnStatus,
        roomServer,
        setPeerConnStatus,
        setRoomServer,
        auth
    }), [auth, peerConnStatus, roomServer, setPeerConnStatus, setRoomServer])

    return <LogContext.Provider value={value}>{children}</LogContext.Provider>
}
