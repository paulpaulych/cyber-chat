import {RoomServer} from "./useRoomServer";
import {RTCConn} from "./useRtcPeerConnection";
import {useEffect, useState} from "react";
import {isOk} from "../../utils/Res";

type IceCandidateExchange = {
    ready: boolean
    error: string | null
}

export function useIceCandidatesExchange(
    server: RoomServer,
    conn: RTCConn,
    canStart: boolean
): IceCandidateExchange {
    const [error, setError] = useState<string>()

    const localGatheringComplete = conn.status.iceGatheringState === "complete"
    const [remoteGatheringComplete, setRemoteGatheringComplete] = useState(false)

    useEffect(function handleLocalIceCandidate() {
        if (!canStart) return
        if (localGatheringComplete) return

        if (!conn.iceCandidate) return
        if (!isOk(conn.iceCandidate)) {
            setError(conn.iceCandidate.value)
            return
        }

        const candidate = conn.iceCandidate.value
        server.sendSignal({type: "IceCandidate", candidate: JSON.stringify(candidate)})
    }, [conn, server, localGatheringComplete, canStart])

    useEffect(function handleRemoteIceCandidate() {
        if (!canStart) return
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
    }, [server.lastSignal, conn, remoteGatheringComplete, canStart])


    useEffect(function notifyOnGatheringComplete() {
        if (!canStart) return
        if (localGatheringComplete) return

        server.sendSignal({type: "IceGatheringComplete"})
    }, [server.sendSignal, localGatheringComplete, canStart])

    useEffect(function handleRemoteGatheringComplete() {
        if (!canStart) return
        if (remoteGatheringComplete) return
        if (!server.lastSignal) return
        if (server.lastSignal.type !== "IceGatheringComplete") return

        setRemoteGatheringComplete(true)
    }, [remoteGatheringComplete, server.lastSignal, canStart])

    return {
        ready: remoteGatheringComplete && localGatheringComplete,
        error
    }
}