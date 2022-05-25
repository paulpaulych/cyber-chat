import {ExitStatus, Printable, SysCall} from "../terminal/process-api";

export function sysPrint(values: Printable[]): SysCall {
    return { type: "print", values }
}

export function sysExit(status: ExitStatus): SysCall {
    return { type: "exit", status }
}
