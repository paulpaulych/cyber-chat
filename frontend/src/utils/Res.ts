
export type Res<T, E> =
    | { _kind: "OK", value: T }
    | { _kind: "ERR", value: E }

export function ok<T, E>(value: T): Res<T, E> {
    return { _kind: "OK", value }
}

export function err<T, E>(value: E): Res<T, E> {
    return { _kind: "ERR", value }
}

export function map<T, E, R>(
    r: Res<T, E>,
    f: (v: T) => R
): Res<R, E> {
    if (r._kind === "OK") {
        return ok(f(r.value))
    }
    return r
}

export function mapErr<T, E, R>(
    r: Res<T, E>,
    f: (v: E) => R
): Res<T, R> {
    if (r._kind === "ERR") {
        return err(f(r.value))
    }
    return r
}

export function onOk<T, E>(
    r: Res<T, E>,
    f: (v: T) => void
): Res<T, E> {
    if (r._kind === "OK") {
        f(r.value)
    }
    return r
}

export function onErr<T, E>(
    r: Res<T, E>,
    f: (v: E) => void
): Res<T, E> {
    if (r._kind === "ERR") {
        f(r.value)
    }
    return r
}

export function errOrNull<T, E>(r: Res<T, E>): E | null {
    return  r._kind === "ERR" ? r.value : null
}

export function okOrNull<T, E>(r: Res<T, E>): T | null {
    return  r._kind === "OK" ? r.value : null
}

export function isOk<T, E>(r: Res<T, E>): r is { _kind: "OK", value: T } {
    return r._kind === "OK"
}