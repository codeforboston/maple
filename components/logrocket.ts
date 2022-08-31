import { useEffect } from "react";
import { createService } from "./service";
import LogRocket from "logrocket";
import { useAuth } from "./auth";

export const { Provider: LogRocketProvider } = createService(() => {
    useEffect(() => {
        const logrocketId = 'a9zjgu/maple'
        LogRocket.init(logrocketId)
    })
    const { user } = useAuth()
    console.log(user)
    useEffect(() => {
        if(user && user.email) {
            console.log(user.email)
            LogRocket.identify(user.email)
        }
    }, [user])
})