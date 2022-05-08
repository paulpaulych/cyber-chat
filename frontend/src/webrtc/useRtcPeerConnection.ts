import {useCallback, useEffect, useRef, useState} from "react";
import {err, ok, Res} from "../utils/Res";

const STAN_SERVER = "stun:stun.stunprotocol.org"

export type RTCConn = {
    status: RTCConnStatus
    remoteStream: MediaStream | null

    iceCandidate: Res<IceCandidate, string> | null
    addIceCandidate: (candidate: IceCandidate) => Promise<void>,
    addStream: (MediaStreamTrack) => void
    prepareOffer: () => Promise<SDP>
    prepareAnswer: (offer: SDP) => Promise<SDP>
    attachAnswer: (answer: SDP) => Promise<void>
}

export type RTCConnStatus = {
    iceConnectionState: RTCIceConnectionState,
    iceGatheringState: RTCIceGathererState,
    eventLog: string[]
}

type IceCandidate = RTCIceCandidateInit
type SDP = string

export function useRtcPeerConnection(): RTCConn {
    const [eventLog, setEventLog] = useState<string[]>([])

    const pushEvent = (src: "user" | "conn", s: string) => {
        setEventLog(prev => prev.concat(`from '${src}': ${s}`))
    }

    const connection = useRef<RTCPeerConnection>((() => {
        pushEvent("user", "initializing connection")
        return new RTCPeerConnection({
            iceServers: [{ urls: STAN_SERVER }]
        })
    })())

    const [iceConnectionState, setIceConnectionState] = useState<RTCIceConnectionState>("new")
    const [iceGatheringState, setIceGatheringState] = useState<RTCIceGathererState>("new")
    const [remoteStream, setRemoteStream] = useState<MediaStream>(null)
    const [iceCandidate, setIceCandidate] = useState<Res<IceCandidate, string>>(null)

    useEffect(() => {
        const conn = connection.current

        const pushConnEvent = (e) => pushEvent("conn", e)

        const onTrack = (e) => {
            pushConnEvent("track event")
            setRemoteStream(e.streams[0])
        }

        const onIceCandidate = (e: RTCPeerConnectionIceEvent) => {
            pushConnEvent(`IceCandidate event`)
            setIceCandidate(ok(e.candidate.toJSON()))
        }

        const onIceCandidateError = (e) => {
            const errMsg = JSON.stringify(e)
            pushConnEvent(`IceCandidateError event: ${errMsg}`)
            setIceCandidate(err(errMsg))
        }

        const onNegotiationNeeded = (e) => {
            pushConnEvent("NegotiationNeeded event")
        }

        const onIceConnStateChange = () => {
            pushConnEvent("IceConnectionStateChanged")
            setIceConnectionState(conn.iceConnectionState)
        }

        const onIceGatheringStateChange = () => {
            pushConnEvent("IceGatheringStateChanged")
            setIceGatheringState(conn.iceGatheringState)
        }

        conn.ontrack = onTrack
        conn.onicecandidate = onIceCandidate
        conn.onicecandidateerror = onIceCandidateError
        conn.onnegotiationneeded = onNegotiationNeeded
        conn.oniceconnectionstatechange = onIceConnStateChange
        conn.onicegatheringstatechange = onIceGatheringStateChange
    }, [connection])

    const addStream = useCallback((stream: MediaStream) => {
        stream.getTracks().forEach(t => connection.current.addTrack(t))
    }, [connection])

    const prepareOffer = useCallback(async () => {
        const offer = await connection.current.createOffer()
        await connection.current.setLocalDescription(offer)
        return offer.sdp
    }, [connection])

    const prepareAnswer = useCallback(async (o) => {
        await connection.current.setRemoteDescription(o)
        const answer = await connection.current.createAnswer()
        await connection.current.setLocalDescription(answer)
        return answer.sdp
    }, [connection])

    const attachAnswer = useCallback(async (sdp) => {
        await connection.current.setRemoteDescription({ type: "answer", sdp})
    }, [connection])

    const addIceCandidate = useCallback(async (c) => {
        await connection.current.addIceCandidate(c)
    }, [connection])

    return {
        status: {
            iceConnectionState,
            iceGatheringState,
            eventLog
        },
        remoteStream,
        addStream,
        iceCandidate: iceCandidate,
        prepareAnswer,
        prepareOffer,
        attachAnswer,
        addIceCandidate
    }
}