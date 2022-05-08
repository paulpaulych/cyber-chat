import {SignalServer} from "./SignalServer";
import {useEffect, useState} from "react";
import {RTCConn} from "./useRtcPeerConnection";
import {useIceCandidatesExchange} from "./useIceCandidatesExchange";


export function useReceiverNegotiation(
    server: SignalServer,
    conn: RTCConn,
): { stream: MediaStream | null, error: string | null } {

    const [offerReceived, setOfferReceived] = useState(false)
    const [sdpExchangeFinished, setSdpExchangeFinished] = useState(false)
    const [error, setError] = useState<string>()

    useEffect(function handleError() {
        if (!server.lastSignal) return
        if (server.lastSignal.type !== "Error") return

        setError("Error received: " + server.lastSignal.code)
        return
    }, [server.lastSignal, conn])

    useEffect(function handleOffer() {
        if (offerReceived) return
        if (sdpExchangeFinished) return
        if (!server.lastSignal) return
        if (server.lastSignal.type !== "Offer") return

        setOfferReceived(true)

        conn.prepareAnswer(server.lastSignal.sdp)
            .then((sdp) => {
                server.sendSignal({type: "Answer", sdp})
                setSdpExchangeFinished(true)
            })
            .catch((e) => {
                const err = `error answering on offer : ${e.message}`
                console.log(err)
                setError(err)
            })
    }, [conn, server, sdpExchangeFinished, offerReceived])

    const iceCandidateExchange = useIceCandidatesExchange(server, conn)

    return {
        stream: conn.remoteStream,
        error: error || iceCandidateExchange.error
    }
}

