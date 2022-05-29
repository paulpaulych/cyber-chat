import {NEW_LINE, sysExit, sysPrint} from "../terminal/api/system-call";
import {LaunchProcess} from "../terminal/api/process-api";
import {AuthUser} from "../../auth/AuthContext";
import {RoomId} from "../UserArea";

export function createRoom(props: {
    user: AuthUser,
    setRoomId: (id: RoomId) => void,
}): LaunchProcess {
    return ({sysCall}) => {
        const doCreate = (req: CreateRoomReq) => sendCreateRoomRes(props.user, req)

        sysCall(sysPrint(["Enter room name: ", NEW_LINE, "> "]))

        let roomName: string | null = null
        let hostName: string | null = null

        return {
            onInterrupt: () => {
                console.log("createRoom interrupted")
            },
            onInput: (input) => {
                console.log("createRoom got input: " + input)
                if (roomName === null) {
                    roomName = input
                    sysCall(sysPrint([NEW_LINE, "Enter host name: ", NEW_LINE, "> "]))
                    return
                }
                if (hostName === null) {
                    hostName = input
                    sysCall(sysPrint([NEW_LINE, "Creating...", NEW_LINE]))
                    doCreate({name: roomName, host_name: hostName})
                        .then(res => {
                            sysCall(sysPrint([`Room '${roomName}' created. ID: ${res.id}`, NEW_LINE]))
                            props.setRoomId({value: res.id})
                            sysCall(sysExit({code: "ok"}))
                        })
                        .catch(e => {
                            sysCall(sysExit({code: "err", error: e.toString()}))
                        })
                    return
                }
                return
            }
        }
    }
}

type CreateRoomRes = {
    id: string
}

type CreateRoomReq = {
    name: string,
    host_name: string | null
}

function sendCreateRoomRes(
    auth: AuthUser,
    req: CreateRoomReq
): Promise<CreateRoomRes> {
    return fetch("http://localhost:8080/api/rooms", {
        body: JSON.stringify(req),
        method: "POST",
        headers: [
            ["Authorization", "Bearer " + auth.accessToken],
            ["Content-Type", "application/json; charset=utf-8"]
        ]
    })
        .then(res => {
            if (res.status !== 201) {
                return Promise.reject("failed to get your id: " + res.statusText)
            }
            return res.json()
        })
}