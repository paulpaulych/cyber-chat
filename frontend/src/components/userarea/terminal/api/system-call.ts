export type Text = string

export type ExitStatus =  { code: "ok" } | { code: "err", error: Text }

export const NEW_LINE = { }

export type Printable = typeof NEW_LINE | string

export type SysCall =
    | { type: "print", values: Printable[] }
    | { type: "exit", status: ExitStatus }


export function sysPrint(values: Printable[]): SysCall {
    return { type: "print", values }
}

export function sysExit(status: ExitStatus): SysCall {
    return { type: "exit", status }
}
