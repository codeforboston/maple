import { useRouter } from "next/router"
import { useCallback, useEffect } from "react"
import { useAsync } from "react-async-hook"
import { Spinner } from "react-bootstrap"
import { useAuth } from "../components/auth"
import { createPage } from "../components/page"
import { ProfilePage } from "../components/ProfilePage/Profile"

export default createPage({
  title: "Profile",
  Page: () => {
    const { id, loading } = useProfileRouting()

    id && console.log("profile create page id", id)

    if (loading) {
      return (
        <div className={`d-grid place-content-center`}>
          <Spinner animation={"border"} />
        </div>
      )
    }

    return <div>{id && <ProfilePage id={id} />}</div>
  }
})

const useProfileRouting = () => {
  const { isReady, query, push } = useRouter()

  const { user } = useAuth()

  useEffect(() => {
    if (!isReady) return
  }, [isReady, query])

  const getUrlId = useCallback(async () => {
    if (!isReady) return

    const qid = query.id
    const validatedId: string | undefined =
      typeof qid === "string" ? qid : user?.uid

    return validatedId
  }, [isReady, query.id, user?.uid])

  const { result: id, loading } = useAsync(getUrlId, [getUrlId])

  return { id, loading }
}
