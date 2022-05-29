import {SignalServer} from "./useSignalServer";
import {useEffect, useState} from "react";
import {RTCConn} from "./useRtcPeerConnection";
import {useIceCandidatesExchange} from "./useIceCandidatesExchange";

type SenderNegotiation = {
    ready: boolean
    error: string
}

export function useSenderNegotiation(
    server: SignalServer,
    conn: RTCConn,
    stream: MediaStream | null,
): SenderNegotiation {

    const sdpExchange = useSenderSdpExchange(server, conn, stream)

    const iceCandidatesExchange = useIceCandidatesExchange(server, conn, sdpExchange.ready)

    return {
        ready: sdpExchange.ready && iceCandidatesExchange.ready,
        error: sdpExchange.error || iceCandidatesExchange.error
    }
}

function useSenderSdpExchange(
    server: SignalServer,
    conn: RTCConn,
    stream: MediaStream | null,
): { ready: boolean, error: string } {
    const [error, setError] = useState<string>()

    console.log("rendering useSenderSdpExchange")

    const [mediaAttached, setMediaAttached] = useState(false)
    const [offerSent, setOfferSent] = useState(false)
    const [ready, setReady] = useState(false)

    useEffect(function attachMedia() {
        if (!stream || mediaAttached) return

        conn.addStream(stream)
        setMediaAttached(true)
    }, [stream, conn, mediaAttached])

    //TODO: offer is creating multiple times
    useEffect(function sendOffer() {
        if (!mediaAttached) return
        if (ready) return

        conn.prepareOffer()
            .then((sdp) => {
                server.sendSignal({type: "Offer", sdp})
                setOfferSent(true)
            })
            .catch((e) => setError("can't send offer: " + e.message))
    }, [server, conn, stream, ready, mediaAttached])

    useEffect(function handleError() {
        if (!server.lastSignal) return
        if (server.lastSignal.type !== "Error") return

        setError("Error received: " + server.lastSignal.code)
        return
    }, [server.lastSignal, offerSent, conn])

    useEffect(function handleAnswer() {
        if (!offerSent) return
        if (ready) return
        if (!server.lastSignal) return
        if (server.lastSignal.type !== "Answer") return

        conn.attachAnswer(server.lastSignal.sdp)
            .then(() => setReady(true))
            .catch((e) => {
                const err = `error attaching answer: ${e.message}`
                console.log(err)
                setError(err)
            })
    }, [conn, server.lastSignal, offerSent, ready])

    return {ready, error}
}
