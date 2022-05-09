import {UseSignalServer} from "./useSignalServer";
import {RTCConn} from "./useRtcPeerConnection";
import {useEffect, useState} from "react";
import {isOk} from "../../utils/Res";

export function useIceCandidatesExchange(
    server: UseSignalServer,
    conn: RTCConn
): { ready, error } {
    const [error, setError] = useState<string>()

    const localGatheringComplete = conn.status.iceGatheringState === "complete"
    const [remoteGatheringComplete, setRemoteGatheringComplete] = useState(false)

    useEffect(function handleLocalIceCandidate() {
        if (localGatheringComplete) return

        if (!conn.iceCandidate) return
        if (!isOk(conn.iceCandidate)) {
            setError(conn.iceCandidate.value)
            return
        }

        const candidate = conn.iceCandidate.value
        server.sendSignal({type: "IceCandidate", candidate: JSON.stringify(candidate)})
    }, [conn, server, localGatheringComplete])

    useEffect(function handleRemoteIceCandidate() {
        if (remoteGatheringComplete) return
        if (!server.lastSignal) return
        if (server.lastSignal.type !== "IceCandidate") return

        const candidate = JSON.parse(server.lastSignal.candidate)
        conn.addIceCandidate(candidate)
            .then(() => setRemoteGatheringComplete(true))
            .catch((e) => {
                const err = `error adding ice candidate: ${e.message}`
                console.log(err)
                setError(err)
            })
    }, [server, conn, remoteGatheringComplete])


    useEffect(function notifyOnGatheringComplete() {
        if (localGatheringComplete) return

        server.sendSignal({type: "IceGatheringComplete"})
    }, [server, localGatheringComplete])

    useEffect(function handleRemoteGatheringComplete() {
        if (remoteGatheringComplete) return
        if (!server.lastSignal) return
        if (server.lastSignal.type !== "IceGatheringComplete") return

        setRemoteGatheringComplete(true)
    }, [remoteGatheringComplete, server.lastSignal])

    return {
        ready: remoteGatheringComplete && localGatheringComplete,
        error
    }
}