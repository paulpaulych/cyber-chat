import {sysPrint, sysExit, NEW_LINE} from "../terminal/api/system-call";
import {LaunchProcess} from "../terminal/api/process-api";
import {AuthUser} from "../../auth/AuthContext";

export function getMyId(user: AuthUser): LaunchProcess {
    return ({sysCall}) => {
        fetch("http://localhost:8080/api/users/me", {
            headers: [["Authorization", "Bearer " + user.accessToken]]
        })
            .then(res => {
                if (res.status !== 200) {
                    sysCall(sysExit({ code: "err", error: "failed to get your id: " + res.statusText }))
                    return
                }
                return res.json()
            })
            .then((res: MeResponse) => {
                sysCall(sysPrint(["your id is " + res.id, NEW_LINE]))
                sysCall(sysExit({ code: "ok" }))
            })
            .catch(e => {
                sysCall(sysExit({ code: "err", error: e.toString() }))
            })
        return {
            onInterrupt: () => { console.log("getMyId interrupted")},
            onInput: (input) => {
                console.log("getMyId got input: " + input)
            }
        }
    }
}

type MeResponse = {
    id: string
}