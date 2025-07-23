import { useAuth } from '.'
import { useRouter } from "next/router"
import { useEffect } from "react"

interface ProtectedPageWrapperProps {
  children: React.ReactNode
}

export const ProtectedPageWrapper = ({ children }: ProtectedPageWrapperProps) => {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      const currentPath = router.asPath
      router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`)
    }
  }, [user, loading, router])

  if (loading || !user) {
    return <div>Loading...</div>
  }

  return <>{children}</>
}