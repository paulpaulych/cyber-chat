export function GeneralError(props: {
    error: string
}) {
    return <span className="Err">{props.error}</span>
}