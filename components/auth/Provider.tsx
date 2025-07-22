import { useEffect } from "react"
import { getAuth, onAuthStateChanged, User } from "firebase/auth"
import { useDispatch } from "react-redux"
import { authChanged } from "./redux"

export const Provider: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  const dispatch = useDispatch()

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      dispatch(authChanged({ user }))
    })

    return () => unsubscribe()
  }, [])

  return <>{children}</>
}
