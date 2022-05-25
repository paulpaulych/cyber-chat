import React, {useState} from 'react';
import {Mode, VideoChat} from "./components/VideoChat";
import {SiteHeader} from "./components/SiteHeader";
import "./App.css";
import {echo} from "./components/userarea/commands/echo";
import {Terminal} from "./components/userarea/terminal/Terminal";

export default function App() {
    const [mode, setMode] = useState<Mode | null>(null)

    return (
        <div className="App">
            <SiteHeader/>
            { mode === null
                ? <div>
                    <label>CHOOSE YOUR MODE</label>
                    <button onClick={() => setMode("send")}>SEND</button>
                    <button onClick={() => setMode("recv")}>RECV</button>
                  </div>
                : <VideoChat mode={mode}/>
            }
            <Terminal launchers={[
                { cmd: "echo", launch: echo },
            ]}/>
        </div>
    );
}
