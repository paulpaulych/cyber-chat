import {SignalServer} from "./SignalServer";
import {RTCConn} from "./useRtcPeerConnection";
import {useEffect, useState} from "react";
import {isOk} from "../utils/Res";

export function useIceCandidatesExchange(
    server: SignalServer,
    conn: RTCConn
): { ready, error } {
    const [iceCandidateReceived, setIceCandidateReceived] = useState(false)
    const [iceCandidateSent, setIceCandidateSent] = useState(false)
    const [error, setError] = useState<string>()

    useEffect(function handleLocalIceCandidate() {
        if (!conn.iceCandidate) return
        if (!isOk(conn.iceCandidate)) {
            setError(conn.iceCandidate.value)
            return
        }

        const candidate = conn.iceCandidate.value
        server.sendSignal({type: "IceCandidate", candidate: JSON.stringify(candidate)})
        setIceCandidateSent(true)
    }, [conn, server])

    useEffect(function handleRemoteIceCandidate() {
        if (!server.lastSignal) return
        if (server.lastSignal.type !== "IceCandidate") return

        const candidate = JSON.parse(server.lastSignal.candidate)
        conn.addIceCandidate(candidate)
            .then(() => setIceCandidateReceived(true))
            .catch((e) => {
                const err = `error adding ice candidate: ${e.message}`
                console.log(err)
                setError(err)
            })
    }, [server, conn, iceCandidateSent])

    return {
        ready: iceCandidateReceived && iceCandidateSent,
        error
    }
}