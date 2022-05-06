import React, {useRef} from "react";

export const RtcConnContext = React.createContext<RTCPeerConnection>(null)

export const RtcConnProvider = (props: { children }) => {
    const conn = useRef<RTCPeerConnection>((() => {
        console.log("initializing RTCPeerConnection")
        return new RTCPeerConnection()
    })())

    return (
        <RtcConnContext.Provider value={conn.current}>
            {props.children}
        </RtcConnContext.Provider>
    )
}
