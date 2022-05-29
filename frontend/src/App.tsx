import React, {Dispatch, SetStateAction, useCallback, useMemo, useState} from 'react';
import {Mode, VideoChat} from "./components/VideoChat";
import {SiteHeader} from "./components/SiteHeader";
import "./App.css";
import {echo} from "./components/userarea/commands/echo";
import {Terminal} from "./components/userarea/terminal/Terminal";
import {doSomeExternalWork} from "./components/userarea/commands/doSomeExternalWork";
import {LaunchProcess, ProcessFactory} from "./components/userarea/terminal/api/process-api";
import {NEW_LINE} from "./components/userarea/terminal/api/system-call";

export default function App() {
    const [title, setTitle] = useState("Cyber Chat")

    const [mode, setMode] = useState<Mode | null>(null)

    const commands = useCommands({setTitle})
    const processFactory = useProcessFactory(commands)

    return (
        <div className="App">
            <SiteHeader title={title}/>
            { mode === null
                ? <div>
                    <label>CHOOSE YOUR MODE</label>
                    <button onClick={() => setMode("send")}>SEND</button>
                    <button onClick={() => setMode("recv")}>RECV</button>
                  </div>
                : <VideoChat mode={mode}/>
            }
            <Terminal processFactory={processFactory}/>
        </div>
    );
}

type Commands = Record<string, LaunchProcess>

function useCommands(props: {
    setTitle: Dispatch<SetStateAction<string>>
}): Commands {
    return useMemo(() => ({
        "echo": echo,
        "change-title": doSomeExternalWork(props.setTitle)
    }), [props.setTitle])
}

function useProcessFactory(commands: Commands): ProcessFactory {
    return useCallback((cmd: string) => {
        const launch = commands[cmd]
        if (!launch) {
            return { _tag: "err", message: ["unknown process: " + cmd, NEW_LINE]}
        }
        return { _tag: "ok", launch }
    }, [commands])
}
