import { useAuth } from "./redux"
import { useAppDispatch } from "components/hooks"
import { setProtectedPageAccess, authStepChanged } from "./redux"
import { useRouter } from "next/router"
import { useEffect } from "react"

interface ProtectedPageWrapperProps {
  children: React.ReactNode
}

export default function ProtectedPageWrapper({
  children
}: ProtectedPageWrapperProps) {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { authenticated, loading, user, justLoggedOut } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (!authenticated && user === null && !justLoggedOut) {
        dispatch(
          setProtectedPageAccess({
            isFromProtectedPage: true,
            url: router.asPath
          })
        )
        dispatch(authStepChanged("start"))
      } else if (authenticated && user) {
        dispatch(
          setProtectedPageAccess({
            isFromProtectedPage: false,
            url: undefined
          })
        )
      }
    }
  }, [authenticated, loading, user, justLoggedOut, dispatch, router.asPath])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!authenticated || !user) {
    return null
  }

  return <>{children}</>
}
