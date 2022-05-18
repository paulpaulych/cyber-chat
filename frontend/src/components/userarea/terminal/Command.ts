export interface Cmd<I, O> {

    exec(input: I): Promise<Step<I, O>>
}

type Step<I, O> = LastStep<I, O> | InputRequired<I, O>;

type LastStep<I, O> = {
    isLast: true,
    output: O
}

type InputRequired<I, O> = {
    isLast: false
    output: O,
    input(input: I)
}
