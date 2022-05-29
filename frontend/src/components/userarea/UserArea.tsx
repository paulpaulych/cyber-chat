import "./UserArea.css"
import {useCallback, useEffect, useMemo, useState} from "react";
import {Auth} from "../auth/AuthContext";
import {echo} from "./commands/echo";
import {getMyId} from "./commands/getMyId";
import {LaunchProcess, ProcessFactory} from "./terminal/api/process-api";
import {NEW_LINE} from "./terminal/api/system-call";
import {Terminal} from "./terminal/Terminal";
import {Room} from "./Room";

type RoomId = {
    value: string
}

export const UserArea = ({auth}: {
    auth: Auth
}) => {
    const [error, setError] = useState<string>()
    const [roomId] = useState<RoomId>()

    useEffect(() => {
        if (auth._tag === "err") {
            setError(auth.error)
        }
    }, [auth])

    const commands = useCommands({auth, roomId})
    const processFactory = useProcessFactory(commands)

    return <div className="UserArea">
        <div className="UserAreaVideo">
            {roomId && <Room id={roomId} mode={"send"}/>}
        </div>
        <div className="UserAreaTerminal">
            <Terminal error={error} processFactory={processFactory}/>
        </div>
    </div>
}

type Commands = Record<string, LaunchProcess>

function useCommands(props: {
    auth: Auth,
    roomId: RoomId | null
}): Commands {
    return useMemo(() => {
        const commands: Commands = {}

        if (props.auth._tag === "ok") {
            commands["me"] = getMyId(props.auth.user)
        }

        commands["echo"] = echo

        return commands
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
