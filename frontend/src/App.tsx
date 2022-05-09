import React, {useState} from 'react';
import {Mode, VideoChat} from "./components/VideoChat";
import {SiteHeader} from "./components/SiteHeader";

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
        </div>
    );
}
