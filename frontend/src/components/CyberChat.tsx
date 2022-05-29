import {SystemLog} from "./systemarea/SystemLog";
import "./VideoChat.css"
import {UserArea} from "./userarea/UserArea";
import {SiteHeader} from "./SiteHeader";
import React, {useContext} from "react";
import {LogContextProvider} from "./log/LogContext";
import {AuthContext} from "./auth/AuthContext";

export type Mode = "send" | "recv"

export function CyberChat() {
    const auth = useContext(AuthContext)

    return (
        <>
            <SiteHeader title="CyberChat"/>
            <LogContextProvider>
                <div className="Chat">
                    <div className="ChatUserArea">
                        <UserArea auth={auth}/>
                    </div>
                    <div className="ChatSystemArea">
                        <SystemLog/>
                    </div>
                </div>
            </LogContextProvider>
        </>
    )
}
