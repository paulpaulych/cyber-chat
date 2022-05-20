
export type Text = string

export type ProcessOutput =
    | { type: "regular", text: Text }
    | { type: "error", text: Text }
    | { type: "exit", status: { code: "ok" } | { code: "err", error: Text } }

export type ProcessParams = {
    setOutput: (output: ProcessOutput) => void
}

export type Process = (input: string) => void

export type LaunchProcess = (params: ProcessParams) => Process
