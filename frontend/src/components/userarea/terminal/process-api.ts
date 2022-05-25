
export type Text = string

export type ExitStatus =  { code: "ok" } | { code: "err", error: Text }

export const NEW_LINE = { }

export type Printable = typeof NEW_LINE | string

export type SysCall =
    | { type: "print", values: Printable[] }
    | { type: "exit", status: ExitStatus }

export type ProcessParams = {
    sysCall: (call: SysCall) => void
}

export type OnInput = (input: string) => void

export type Process = {
    onInput: OnInput
    onInterrupt: () => void
}

export type LaunchProcess = (params: ProcessParams) => Process
