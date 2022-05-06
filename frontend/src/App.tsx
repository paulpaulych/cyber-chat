import React from 'react';
import {SignalServerProvider} from "./webrtc/SignalServer";
import {VideoChat} from "./components/VideoChat";
import {RtcConnProvider} from "./webrtc/WebRtcConn";

export default function App() {
    console.log("rendering App")
    return (
        <SignalServerProvider url={"ws://localhost:8080/ws"}>
            <RtcConnProvider>
                <VideoChat/>
            </RtcConnProvider>
        </SignalServerProvider>
    )
}
