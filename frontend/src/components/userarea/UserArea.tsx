import "./UserArea.css"
import {useCallback, useMemo, useState} from "react";
import {Auth} from "../auth/AuthContext";
import {echo} from "./commands/echo";
import {getMyId} from "./commands/getMyId";
import {LaunchProcess, ProcessFactory} from "./terminal/api/process-api";
import {NEW_LINE} from "./terminal/api/system-call";
import {Terminal} from "./terminal/Terminal";
import {Room} from "./Room";
import {createRoom} from "./commands/createRoom";

export type RoomId = {
    value: string
}

export const UserArea = (props: {
    auth: Auth,
}) => {
    const [roomId, setRoomId] = useState<RoomId>()

    const error = props.auth._tag === "err" ? props.auth.error : null
    const commands = useCommands({
            auth: props.auth,
            setRoomId: id => setRoomId(id)}
        )

    const processFactory = useProcessFactory(commands)

    return <div className="UserArea">
        <div className="UserAreaRoom">
            {roomId && <Room streamActive={false} id={roomId} mode={"send"}/>}
        </div>
        <div className="UserAreaTerminal">
            <Terminal error={error} processFactory={processFactory}/>
        </div>
    </div>
}

type Commands = Record<string, LaunchProcess>

function useCommands(props: {
    auth: Auth,
    setRoomId: (id: RoomId) => void,
}): Commands {
    return useMemo(() => {
        if (props.auth._tag !== "ok") {
            return {}
        }

        return {
            "me": getMyId(props.auth.user),
            "echo": echo,
            "room": createRoom({
                user: props.auth.user,
                setRoomId: props.setRoomId
            })
        }
    }, [props])
}

function useProcessFactory(commands: Commands): ProcessFactory {
    return useCallback((cmd: string) => {
        const launch = commands[cmd]
        if (!launch) {
            return {_tag: "err", message: ["unknown process: " + cmd, NEW_LINE]}
        }
        return {_tag: "ok", launch}
    }, [commands])
}
