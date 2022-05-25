export type Out =
    | { type: "prelude", user: string }
    | { type: "text", value: string }
    | { type: "br" }

export function TerminalOutput(props: {
    enablePrelude: boolean,
    user: string,
    output: Out[]
}) {
    return (<>
        {props.output.map(renderOut)}
        {props.enablePrelude && <CmdPrelude user={props.user}/>}
    </>)
}

function renderOut(item: Out, i: number) {
    switch (item.type) {
        case "br":
            return <br key={i}/>
        case "text":
            return <span key={i} className="Msg">{item.value}</span>
        case "prelude":
            return <CmdPrelude key={i} user={item.user}/>
    }
}

function CmdPrelude(props: { user: string }) {
    return (<span className="bold">{props.user}@cyberchat:~$ </span>)
}
