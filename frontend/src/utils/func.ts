
export function mapNullable<T, R>(v: T | null, f: (v: T) => R): R | null {
    return v === null ? null : f(v)
}