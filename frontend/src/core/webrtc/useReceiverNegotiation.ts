import {SignalServer} from "./useSignalServer";
import {RTCConn} from "./useRtcPeerConnection";
import {useIceCandidatesExchange} from "./useIceCandidatesExchange";
import {useEffect, useState} from "react";

type ReceiverNegotiation = {
    ready: boolean
    stream: MediaStream | null
    error: string | null
}

export function useReceiverNegotiation(
    server: SignalServer,
    conn: RTCConn,
): ReceiverNegotiation {

    const sdpExchange = useReceiverSdpExchange(server, conn)
    const iceCandidateExchange = useIceCandidatesExchange(server, conn, sdpExchange.ready)

    return {
        ready: sdpExchange.ready && iceCandidateExchange.ready,
        stream: conn.remoteStream,
        error: sdpExchange.error ?? iceCandidateExchange.error
    }
}

function useReceiverSdpExchange(
    server: SignalServer,
    conn: RTCConn,
): { ready: boolean, error: string | null } {

    const [offerReceived, setOfferReceived] = useState(false)
    const [ready, setReady] = useState(false)
    const [error, setError] = useState<string>()

    useEffect(function handleError() {
        if (!server.lastSignal) return
        if (server.lastSignal.type !== "Error") return

        setError("Error received: " + server.lastSignal.code)
        return
    }, [server.lastSignal, conn])

    useEffect(function handleOffer() {
        if (offerReceived) return
        if (ready) return
        if (!server.lastSignal) return
        if (server.lastSignal.type !== "Offer") return

        setOfferReceived(true)

        conn.prepareAnswer(server.lastSignal.sdp)
            .then((sdp) => {
                server.sendSignal({type: "Answer", sdp})
                setReady(true)
            })
            .catch((e) => {
                const err = `error answering on offer : ${e.message}`
                console.log(err)
                setError(err)
            })
    }, [conn, server, ready, offerReceived])

    return { ready, error }
}
