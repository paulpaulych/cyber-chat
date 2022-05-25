import {sysPrint, sysExit, NEW_LINE} from "../terminal/api/system-call";
import {LaunchProcess} from "../terminal/api/process-api";
import {Dispatch, SetStateAction} from "react";

export function doSomeExternalWork(setPageTitle: Dispatch<SetStateAction<string>>): LaunchProcess {
    return ({sysCall}) => {
        const ms = 3000
        sysCall(sysPrint(["title will be changed in " + ms + "ms", NEW_LINE]))
        timeout(ms)
            .then(() => {
                setPageTitle("NEW TITLE")
                sysCall(sysExit({code: "ok"}))
            })
        return {
            onInterrupt: () => {
                console.log("echo interrupted")
            },
            onInput: (input) => {
                console.log("got input: " + input)
            }
        }
    }
}

function timeout(ms): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        setTimeout(() => resolve(), ms)
    }).then()
}
