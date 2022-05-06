import {useEffect, useState} from "react";
import {Signal, SignalServer} from "./SignalServer";

export function useRemoteMedia(
    server: SignalServer,
    conn: RTCPeerConnection
): { stream: MediaStream | null, error: string | null } {
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [offer, setOffer] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const [ready, setReady] = useState(false)

    useEffect(() => {
        const onSignal = (s) => {
            const data: Signal = JSON.parse(s.data)
            if(data.type !== "Offer") {
                setError("Offer expected but got " + JSON.stringify(s))
                return
            }
            setOffer(data.sdp)
        }

        server.subscribe(onSignal)

        return () => {
            server.subscribe(onSignal)
        }
    }, [server, conn])

    useEffect(() => {
        if (!offer) return

        console.log(`received offer: ${JSON.stringify(offer)}`)
        console.log(`sending answer...`)

        prepareAnswer(conn, offer)
            .then((a) => server.sendSignal({type: "Answer", sdp: a.sdp}))
            .then(() => setReady(true))
            .catch((e) => setError(`can't send answer: ${e.message}`))
    }, [server, conn])

    useEffect(() => {
        if (ready) {
            conn.addEventListener("track", (event) => {
                setStream(event.streams[0])
            })
        }
    }, [conn, ready])

    return {
        stream,
        error
    }
}

export function useMediaSending(
    server: SignalServer,
    conn: RTCPeerConnection,
    stream: MediaStream | null
): { ready: boolean, error: string | null } {
    const [error, setError] = useState<string | null>(null)

    const [answer, setAnswer] = useState<string | null>(null)

    const [ready, setReady] = useState(false)

    useEffect(() => {
        if (!stream) {
            console.log("media stream to send not found")
            setError("media stream to send not found")
            return
        }

        stream.getTracks().forEach((t) => conn.addTrack(t))
    }, [server, conn])

    useEffect(() => {
        if (!stream) {
            console.log("media stream to send not found")
            setError("media stream to send not found")
            return
        }

        console.log("sending offer...")

        prepareOffer(conn)
            .then((o) => server.sendSignal({type: "Offer", sdp: o.sdp}))
            .catch((e) => setError("can't send offer: " + e.message))
    }, [server, conn, stream])

    useEffect(() => {
        const onSignal = (s) => {
            const data: Signal = JSON.parse(s.data)
            if(data.type !== "Answer") {
                setError("Answer expected but got " + JSON.stringify(s))
                return
            }
            setAnswer(data.sdp)
        }

        server.subscribe(onSignal)

        return () => {
            server.subscribe(onSignal)
        }
    }, [server, conn])

    useEffect(() => {
        if (!answer) return

        attachAnswer(conn, answer)
            .then(() => setReady(true))
            .catch((e) => setError(`error attaching answer: ${e.message}`))
    })

    return { ready, error }
}

const prepareOffer = async (conn: RTCPeerConnection) => {
    const offer = await conn.createOffer()
    await conn.setLocalDescription(offer)
    return offer
}

const prepareAnswer = async (conn: RTCPeerConnection, sdp: string) => {
    try {
        await conn.setRemoteDescription({ type: "offer", sdp})
        const answer = await conn.createAnswer()
        await conn.setLocalDescription(answer)
        return answer
    } catch (e) {
        return Promise.reject(e)
    }
}

const attachAnswer = async (conn: RTCPeerConnection, sdp: string) => {
    await conn.setRemoteDescription({ type: "answer", sdp})
}
