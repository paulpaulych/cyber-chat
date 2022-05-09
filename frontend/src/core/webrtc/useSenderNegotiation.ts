import {SignalServer} from "./useSignalServer";
import {useEffect, useState} from "react";
import {RTCConn} from "./useRtcPeerConnection";
import {useIceCandidatesExchange} from "./useIceCandidatesExchange";

export function useSenderNegotiation(
    server: SignalServer,
    conn: RTCConn,
    stream: MediaStream | null
): { ready: boolean, error: string } {
    const [error, setError] = useState<string>()

    const [mediaAttached, setMediaAttached] = useState(false)
    const [offerSent, setOfferSent] = useState(false)
    const [sdpExchangeFinished, setSdpExchangeFinished] = useState(false)

    useEffect(function attachMedia() {
        if (!stream || mediaAttached) return

        conn.addStream(stream)
        setMediaAttached(true)
    }, [stream, conn, mediaAttached])

    useEffect(function sendOffer() {
        if (!mediaAttached) return
        if (sdpExchangeFinished) return

        conn.prepareOffer()
            .then((sdp) => {
                server.sendSignal({type: "Offer", sdp })
                setOfferSent(true)
            })
            .catch((e) => setError("can't send offer: " + e.message))
    }, [server, conn, stream, sdpExchangeFinished, mediaAttached])

    useEffect(function handleError() {
        if (!server.lastSignal) return
        if (server.lastSignal.type !== "Error") return

        setError("Error received: " + server.lastSignal.code)
        return
    }, [server.lastSignal, offerSent, conn])

    useEffect(function handleAnswer() {
        if (!offerSent) return
        if (sdpExchangeFinished) return
        if (!server.lastSignal) return
        if (server.lastSignal.type !== "Answer") return

        conn.attachAnswer(server.lastSignal.sdp)
            .then(() => setSdpExchangeFinished(true))
            .catch((e) => {
                const err = `error attaching answer: ${e.message}`
                console.log(err)
                setError(err)
            })
    }, [conn, server.lastSignal, offerSent, sdpExchangeFinished])

    const iceCandidatesExchange = useIceCandidatesExchange(server, conn)

    return {
        ready: iceCandidatesExchange.ready && sdpExchangeFinished,
        error: error || iceCandidatesExchange.error
    }
}
