
export type Text = string

export type ExitStatus =  { code: "ok" } | { code: "err", error: Text }

export type ProcessOutput =
    | { type: "regular", text: Text }
    | { type: "error", text: Text }
    | { type: "exit", status: ExitStatus }

export type ProcessParams = {
    setOutput: (output: ProcessOutput) => void
}

export type OnInput = (input: string) => void

export type Process = {
    onInput: OnInput
    cancel: () => void
}

export type LaunchProcess = (params: ProcessParams) => Process
