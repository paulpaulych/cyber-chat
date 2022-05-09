import {useEffect, useState} from "react";
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
    signalingState: RTCSignalingState,
    connectionState: RTCPeerConnectionState,
    hasLocalDescription: boolean,
    hasRemoteDescription: boolean,
    eventLog: string[]
}

type IceCandidate = RTCIceCandidateInit
type SDP = string

export function useRtcPeerConnection(): RTCConn | null {
    const [eventLog, setEventLog] = useState<string[]>([])

    const pushEvent = (src: "user" | "conn", s: string) => {
        const msg = `from '${src}': ${s}`
        console.log("conn event: " + msg)
        setEventLog(prev => prev.concat([msg]))
    }

    const [conn, setConn] = useState<RTCPeerConnection | null>(null)

    const [iceConnectionState, setIceConnectionState] = useState<RTCIceConnectionState>()
    const [iceGatheringState, setIceGatheringState] = useState<RTCIceGathererState>()
    const [signalingState, setSignalingState] = useState<RTCSignalingState>()
    const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>()

    const [remoteStream, setRemoteStream] = useState<MediaStream>(null)
    const [iceCandidate, setIceCandidate] = useState<Res<IceCandidate, string>>(null)

    useEffect(() => {
        if (conn !== null) return

        pushEvent("user", "initializing conn")

        const connection = new RTCPeerConnection({
            iceServers: [{ urls: STAN_SERVER }]
        })

        setConn(connection)

        const pushConnEvent = (e) => pushEvent("conn", e)

        const onTrack = (e: RTCTrackEvent) => {
            if (e.streams.length === 0) {
                pushConnEvent("track event with no streams")
                return
            }

            pushConnEvent(`track event with ${e.streams.length} streams`)
            setRemoteStream(e.streams[0])
        }

        const onIceCandidate = (e: RTCPeerConnectionIceEvent) => {
            pushConnEvent(`IceCandidate event`)

            if (!e.candidate) return

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
            pushConnEvent("IceConnectionStateChanged to " + connection.iceConnectionState)
            setIceConnectionState(connection.iceConnectionState)
        }

        const onIceGatheringStateChange = () => {
            pushConnEvent("IceGatheringStateChanged to " + connection.iceGatheringState)
            setIceGatheringState(connection.iceGatheringState)
        }

        const onSignalingStateChange = () => {
            pushConnEvent("SignalingStateChanged to " + connection.signalingState)
            setSignalingState(connection.signalingState)
        }

        const onConnectionStateChange = () => {
            pushConnEvent("ConnectionStateChanged to " + connection.connectionState)
            setConnectionState(connection.connectionState)
        }

        connection.ontrack = onTrack
        connection.onicecandidate = onIceCandidate
        connection.onicecandidateerror = onIceCandidateError
        connection.onnegotiationneeded = onNegotiationNeeded
        connection.oniceconnectionstatechange = onIceConnStateChange
        connection.onicegatheringstatechange = onIceGatheringStateChange
        connection.onsignalingstatechange = onSignalingStateChange
        connection.onconnectionstatechange = onConnectionStateChange

        return () => {
            connection.close()
        }
    }, [])

    if (!conn) return null

    const addStream = (stream: MediaStream) => {
        stream.getTracks().forEach(t => conn.addTrack(t, stream))
    }

    const prepareOffer = async () => {
        const offer = await conn.createOffer()
        await conn.setLocalDescription(offer)
        return offer.sdp
    }

    const prepareAnswer = async (sdp: SDP) => {
        await conn.setRemoteDescription({ type: "offer", sdp })
        console.log("CONNECTION STATUS: " + conn.signalingState)
        const answer = await conn.createAnswer()
        await conn.setLocalDescription(answer)
        return answer.sdp
    }

    const attachAnswer = async (sdp) => {
        await conn.setRemoteDescription({ type: "answer", sdp })
    }

    const addIceCandidate = async (c) => {
        await conn.addIceCandidate(c)
    }

    return {
        status: {
            hasLocalDescription: conn.localDescription !== null,
            hasRemoteDescription: conn.remoteDescription !== null,
            iceConnectionState,
            iceGatheringState,
            signalingState,
            connectionState,
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