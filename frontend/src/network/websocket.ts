import WebSocket from "isomorphic-ws";
import {useEffect, useState} from "react";

type Res = { type: "OK", ws: WebSocket } | { type: "error", error: string}

export function useWebsocket(url: string) {
    const [res, setRes] = useState<Res | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const disconnect = () => { res && res.close() }
        if (res) return

        console.log(`connecting to ${url}...`)

        connect(url)
            .then((s) => {
                setRes(s)
                console.log(`connected to ${url}`)
            })
            .catch((error) => setError(`can't connect to ${url}: ${error}`))

        return disconnect
    }, [url, res, error])

    return { ws: res, error }
}

const connect = (url: string): Promise<WebSocket> => {
    return new Promise((resolve, reject) => {
        const server = new WebSocket(url);
        server.onopen = () => resolve(server);
        server.onerror = (event) => reject(event)
    })
}
