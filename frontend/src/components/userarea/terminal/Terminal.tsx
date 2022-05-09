import "./Terminal.css"

export function Terminal() {
    return (
        <div className="Terminal">
        <br/>
            <span className="Msg bold">My very important call </span>
            <span className="Msg">created.</span>
            <br/>
            <span className="Msg">Join link is now in your clipboard.</span>
            <br/>
            <span className="Msg">You can also use this: </span>
            <a className="Msg" href="">https://videochat.com/join/some-conf-id-1010</a>
            <br/>
            <span className="Msg">Be free to run your commands in this cli. Type 'help' for more.</span>
            <br/>
            <span className="bold">jack@videochat:~$ </span>
            <span className="UserInput">video on</span>
            <br/>
            <span>Message from ROOT: </span><br/>
            <br/>
            <span className="Msg bold">Bob</span>
            <span className="Msg">connected.</span>

            <br/>
            <span className="bold">jack@videochat:~$ </span>
            <span className="bold">█</span>
            <br/>
        </div>
    )
}