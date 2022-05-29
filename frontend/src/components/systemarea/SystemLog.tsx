import {PeerConnStatusBar} from "./PeerConnStatusBar";
import {SignalServerStatusBar} from "./SignalServerStatusBar";
import {useContext} from "react";
import {LogContext} from "../log/LogContext";
import {AuthStatusBar} from "./AuthStatusBar";

export function SystemLog() {
    const log = useContext(LogContext)

    return (
        <div>
            <AuthStatusBar auth={log.auth}/>
            { log.peerConnStatus &&
                <PeerConnStatusBar status={log.peerConnStatus}/>
            }
            { log.roomServer &&
                <SignalServerStatusBar server={log.roomServer}/>
            }
        </div>
    );
}