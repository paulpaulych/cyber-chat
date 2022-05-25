import React, {useMemo, useState} from 'react';
import {Mode, VideoChat} from "./components/VideoChat";
import {SiteHeader} from "./components/SiteHeader";
import "./App.css";
import {echo} from "./components/userarea/commands/echo";
import {Terminal} from "./components/userarea/terminal/Terminal";
import {doSomeExternalWork} from "./components/userarea/commands/doSomeExternalWork";

export default function App() {
    const [title, setTitle] = useState("Cyber Chat")

    const [mode, setMode] = useState<Mode | null>(null)

    const launchers = useMemo(() => {
        return [
            { cmd: "echo", launch: echo },
            { cmd: "change-title", launch: doSomeExternalWork(setTitle) }
        ]
    }, [setTitle])

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
            <Terminal launchers={launchers}/>
        </div>
    );
}
