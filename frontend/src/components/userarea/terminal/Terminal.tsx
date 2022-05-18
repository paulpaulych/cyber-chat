import "./Terminal.css"
import {Dispatch, ReactElement, useState, SetStateAction, useEffect, FormEvent, ChangeEvent} from "react";

type UICmd = {
    exec(input: string): Promise<UIStep>
}

type UIStep = UILastStep | UIInputRequired;

type UILastStep = {
    isLast: true,
    output: string
}

type UIInputRequired = {
    isLast: false
    output: ReactElement,
    input(input: string)
}

type Item =
    | { type: "input", text: string }
    | { type: "output", text: string }

export function Terminal() {

    const [items, setItems] = useState<Item[]>([
        { type: "input", text: "example in"},
        { type: "output", text: "example out"},
        { type: "output", text: "example out 2"},
    ])

    const appendHistory = (text: string) => {
        setItems((prev) => prev.concat([{ type: "input", text}]))
    }

    const renderItem = (item: Item, i) => {
        switch (item.type) {
            case "input": return <li key={i}>
                <span>INPUT: </span>
                <span className="UserInput">{item.text}</span>
                <br/>
            </li>
            case "output": return <li key={i}>
                <span>OUTPUT: </span>
                <span className="Msg">{item.text}</span>
                <br/>
            </li>
        }
    }

    return (
        <div className="Terminal">
            {items.map(renderItem)}
            <Input onInput={appendHistory}/>
        </div>
    )
}

const Input = (props: {
    onInput: Dispatch<SetStateAction<string>>
}) => {
    const [input, setInput] = useState("")
    const [cursorFlashEnabled, setCursorFlashEnabled] = useState(false)
    const [cursorPos, setCursorPos] = useState(0)

    const submit = (e: FormEvent) => {
        e.preventDefault()
        props.onInput(input)
        setInput("")
    }

    useEffect(() => {
        setTimeout(() => {
            setCursorFlashEnabled(prev => !prev)
        }, 500)
    }, [cursorFlashEnabled])

    //TODO: change cursor position on left/right buttons pushed
    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        console.log("change " + e.target.selectionStart)
        setInput(e.target.value)
        setCursorPos(e.target.selectionStart)
    }

    const showInputValue = cursorFlashEnabled
        ? input.substring(0, cursorPos) + "█" + input.substring(cursorPos + 1)
        : input

    const invisibleInput = (
        <form className="TerminalInputForm" onSubmit={submit}>
            <input
                autoFocus
                onBlur={e => e.target.focus()}
                className="AbsoluteLeftTop TerminalInput bold"
                type="text"
                value={input}
                onChange={onChange}
            />
        </form>
    )
    return (
        <>
            <span className="bold">jack@videochat:~$ </span>
            <label className="TerminalInputView">{showInputValue}</label>
            {invisibleInput}
            <br/>
        </>
    )
}


//for example
const bla = () => (
    <>
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
        <br/>
        <span className="bold">jack@videochat:~$ </span>
        <span className="bold">█</span>
    </>
)