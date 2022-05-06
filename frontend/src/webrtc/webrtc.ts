import {useEffect, useState} from "react";
import WebSocket from "isomorphic-ws";
import {useIncomingSignal} from "./signals";

export function useRemoteStream(
    ws: WebSocket
) {
    const [conn] = useState(new RTCPeerConnection())
    const [stream, setStream] = useState<MediaStream | null>(null)

    const offer = useIncomingSignal(ws)

    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!offer) return

        console.log(`received offer: ${offer}`)

        answerFor(conn, offer.sdp)
            .then((a) => sendAnswer(ws, a))
            .catch((e) => setError(e))

        conn.addEventListener("track", (event) => {
            setStream(event.streams[0])
        })

        return () => conn.close()
    }, [ws, conn, offer])

    return {
        stream,
        error
    }
}

export function useRemoteStreamReceiver(
    ws: WebSocket,
    stream: MediaStream | null
) {
    const [conn] = useState(new RTCPeerConnection())

    const answer = useIncomingSignal(ws)

    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!stream) return

        stream.getTracks()
            .forEach((t) => conn.addTrack(t))

        offerTo(conn)
            .then((o) => sendOffer(ws, o))
            .catch(setError)

        return () => conn.close()
    }, [ws, conn, stream])

    useEffect(() => {
        if (!answer) return

        setAnswerFrom(conn, answer.sdp)
            .catch(setError)

        return () => conn.close()
    }, [ws, conn, stream, answer])

    return error
}

const sendAnswer = (ws: WebSocket, answer: RTCSessionDescriptionInit) => {
    ws.send(JSON.stringify({ type: "Answer", sdp: answer.sdp}), { binary: false })
}

const sendOffer = (ws: WebSocket, offer: RTCSessionDescriptionInit) => {
    ws.send(JSON.stringify({type: "Offer", sdp: offer.sdp}), { binary: false }, (err) => {
        if(err) {
            console.log(`can't send offer: ${err}`)
        }
    })
}

const offerTo = async (conn: RTCPeerConnection) => {
    const offer = await conn.createOffer()
    await conn.setLocalDescription(offer)
    return offer
}

const answerFor = async (conn: RTCPeerConnection, sdp: string) => {
    try {
        await conn.setRemoteDescription({ type: "offer", sdp})
        const answer = await conn.createAnswer()
        await conn.setLocalDescription(answer)
        return answer
    } catch (e) {
        return Promise.reject(e)
    }
}

const setAnswerFrom = async (conn: RTCPeerConnection, sdp: string) => {
    await conn.setRemoteDescription({ type: "answer", sdp})
}
