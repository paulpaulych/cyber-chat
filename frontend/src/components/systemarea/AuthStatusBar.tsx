import React from "react";
import {Auth} from "../auth/AuthContext";

export function AuthStatusBar({ auth }: { auth: Auth }) {
    return (
        <div>
            <h3>Auth status: {localize(auth)}</h3>
        </div>
    );
}

const localize = (auth: Auth) => {
    switch (auth._tag) {
        case "err": return "Error - " + auth.error
        case "loading": return "Authenticating..."
        case "ok": return "Success"
    }
}