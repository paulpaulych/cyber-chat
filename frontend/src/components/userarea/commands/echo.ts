import {sysPrint, sysExit, NEW_LINE} from "../terminal/api/system-call";
import {LaunchProcess} from "../terminal/api/process-api";

export const echo: LaunchProcess = ({sysCall}) => {
    sysCall(sysPrint(["ECHO STARTED. print 'exit' to exit"]))
    const prelude = () => {
        sysCall(sysPrint([NEW_LINE, "", NEW_LINE, "type your text", NEW_LINE, "> "]))
    }
    prelude()
    return {
        onInterrupt: () => {
            console.log("echo interrupted")
        },
        onInput: (input) => {
            if (input === "exit") {
                sysCall(sysExit({ code:"ok" }))
                return
            }
            sysCall(sysPrint(["", NEW_LINE, "your text here", NEW_LINE, "> " + input]))
            prelude()
        }
    }
}
