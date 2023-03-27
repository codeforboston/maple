import { useEffect, useState } from "react"
import { Spinner } from "react-bootstrap"
import { useAuth } from "../components/auth"
import { createPage } from "../components/page"
import { ProfilePage } from "../components/ProfilePage/Profile"

export default createPage({
  title: "Profile",
  Page: () => {
    const { id, loading } = useProfileRouting()
    const { authenticated, user } = useAuth()

    return (
      <div>
        {loading ? (
          <div className={`d-grid place-content-center`}>
            <Spinner animation={"border"} />
          </div>
        ) : !loading && !id && authenticated ? (
          <ProfilePage id={user!.uid} />
        ) : id ? (
          <ProfilePage id={id} />
        ) : (
          <div>no user</div>
        )}
      </div>
    )
  }
})

const useProfileRouting = () => {
  const { user } = useAuth()

  const [id, setId] = useState<string>("od")
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (window) {
      const urlParams = new URLSearchParams(window.location?.search)
      const urlid = urlParams.get("id")

      if (urlid === null) {
        if (user?.uid) {
          setId(user.uid)
          urlParams.set("id", user.uid)
        }
      }

      if (typeof urlid === "string") {
        setId(urlid)
      }
      if (urlid !== undefined) {
        setLoading(false)
      }
    }
  }, [id, user?.uid])

  return { id, loading }
}

// this must only be on pages in the pages folder
// it will throw an error if it's in the components folder
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "footer"]))
      // Will be passed to the page component as props
    }
  }
}
