import {SysCall} from "./system-call";

export type ProcessParams = {
    sysCall: (call: SysCall) => void
}

export type OnInput = (input: string) => void

export type Process = {
    onInput: OnInput
    onInterrupt: () => void
}

export type LaunchProcess = (params: ProcessParams) => Process
