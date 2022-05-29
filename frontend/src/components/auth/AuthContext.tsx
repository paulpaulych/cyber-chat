import React, {useEffect, useState} from "react";

export type Auth =
    | { _tag: "ok", user: AuthUser }
    | { _tag: "loading" }
    | { _tag: "err", error: string }

export type AuthUser = { accessToken: string }

export const AuthContext = React.createContext<Auth>(null)

export const AuthProvider = (props: { children }) => {
    const [auth, setAuth] = useState<Auth | null>()

    useEffect(() => {
        if (!!auth) return

        fetch("http://localhost:8080/login")
            .then(res => res.json())
            .then((res: TokenResponse) => {
                setAuth({ _tag: "ok", user: { accessToken: res.access_token } })
            })
            .catch(e => {
                setAuth({ _tag: "err", error: "failed to login: " + JSON.stringify(e) })
            })
    }, [auth])

    const value = auth || { _tag: "loading" }

    return (<AuthContext.Provider value={value} children={props.children}/>)
}

type TokenResponse = {
    access_token: string
}