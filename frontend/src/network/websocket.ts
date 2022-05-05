import WebSocket from "isomorphic-ws";
import {isStringObject} from "util/types";

type Listener<T> = (msg: T) => void

export type WebSocketServer<O, I> = {
    readonly send: (msg: O) => void,
    readonly subscribe: (listener: Listener<I>) => void
}

export function webSocketServer<O, I>(url: string): WebSocketServer<O, I> {
    const ws = new WebSocket(url);

    ws.onopen = () => {
        console.log('WebSocketServer: connected');
    }

    ws.onclose = () => {
        console.log('WebSocketServer: disconnected');
    }

    const listeners: Listener<I>[] = [];

    ws.onmessage = (data) => {
        console.log(`WebSocketServer: received: ${JSON.stringify(data.data)}`);
        listeners.forEach((listener) => {
            if (isStringObject(data.data)) {
                listener(JSON.parse(data.data))
            } else {
                console.log(`WebSocketServer: invalid msg: ${typeof data.data}`);
            }
        })
    }

    return {
        send: ws.send,
        subscribe: listeners.push
    }
}
