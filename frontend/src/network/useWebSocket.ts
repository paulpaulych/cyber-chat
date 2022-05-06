import WebSocket from "isomorphic-ws";
import {useCallback, useEffect, useRef, useState} from "react";
import {ok, Res} from "../utils/Res";

export enum WSStatus {
    DISCONNECTED,
    CONNECTED,
}

type WsSendJson = (data: any) => void

export type ConnectedWS<T> = {
    status: WSStatus.CONNECTED
    sendJson: WsSendJson
    lastMsg: T | null
    error: string | null
}

export type WS<T> =
    | ConnectedWS<T>
    | {
    status: WSStatus.DISCONNECTED
    error: string | null
}

export function useWebSocket<INCOME>(url: string): WS<INCOME> {
    const ws = useRef<WebSocket | null>(null)
    const [status, setStatus] = useState(WSStatus.DISCONNECTED)
    const [error, setError] = useState<string | null>(null)
    const [lastMsgRes, setLastMsgRes] = useState<Res<INCOME, string> | null>(null)

    useEffect(() => {

        console.log(`connecting to ${url}...`)

        if (!ws) return

        const server = new WebSocket(url)
        server.onopen = () => {
            setStatus(WSStatus.CONNECTED)
            console.log(`connected to ${url}`)
        }
        server.onclose = (e) => {
            setStatus(WSStatus.DISCONNECTED)
            console.log(`connection closed`)
        }
        server.onerror = (event) => {
            console.log(`ws error: type=${event.type}, error=${JSON.stringify(event)}`)
            // setStatus(WSStatus.DISCONNECTED)
            setError(`can't connect to ${url}: ${JSON.stringify(event)}`)
        }

        ws.current = server;

        gettingMessage()

        return () => {
            console.log("closing connection...")
            server.close()
        }
    }, [url])

    const gettingMessage = useCallback(() => {
        if (!ws.current) return
        ws.current.onmessage = e => setLastMsgRes(readMessage(e))
    }, [])

    if (status === WSStatus.DISCONNECTED) {
        return { status, error }
    }

    const sendJson = sendJsonFunc(ws.current!!)

    if (!lastMsgRes) {
        return {sendJson, lastMsg: null, status, error: null}
    }

    if (lastMsgRes._kind === "ERR") {
        return {sendJson, lastMsg: null, status, error: lastMsgRes.value}
    }

    const lastMsg = lastMsgRes.value
    return {sendJson, lastMsg, status, error}
}

function readMessage<T>(msg: WebSocket.MessageEvent): Res<T, string> {
    // if (msg.type !== "message") {
    //     return err(`text message expected, bot got ${JSON.stringify(msg.type)}`)
    // }
    return ok(JSON.parse(msg.data as string))
}

function sendJsonFunc(ws: WebSocket): WsSendJson {
    return (data: any) => {
        const json = JSON.stringify(data)
        const opts = {binary: false}
        const onErr = (err: Error) => {
            console.error(`error sending json to WS: ${err.message}`)
        }
        ws.send(json, opts, (err) => { err && onErr(err) })
    }
}