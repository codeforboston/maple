import { useEffect } from "react"
import { createService } from "./service"
import LogRocket from "logrocket"
import { useAuth } from "./auth"

const logRocketId = process.env.NEXT_PUBLIC_LOG_ROCKET_ID ?? "a9zjgu/maple"

export const { Provider: LogRocketProvider } = createService(() => {
  useEffect(() => {
    LogRocket.init(logRocketId)
  }, [])
  const { user } = useAuth()
  useEffect(() => {
    if (user && user.email) {
      LogRocket.identify(user.email)
    }
  }, [user])
})
