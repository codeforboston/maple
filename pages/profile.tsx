import { useEffect, useState } from "react"
import { Spinner } from "react-bootstrap"
import { useAuth } from "../components/auth"
import { createPage } from "../components/page"
import { useTranslation } from "next-i18next"
import { ProfilePage } from "../components/ProfilePage"
import { createGetStaticTranslationProps } from "components/translations"

export default createPage({
  titleI18nKey: "navigation.accountProfile",
  Page: () => {
    const { id, loading } = useProfileRouting()
    const { authenticated, user } = useAuth()
    const { t } = useTranslation("profile")

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
          <div>{t("noUser")}</div>
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

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "footer",
  "profile",
  "editProfile",
  "testimony"
])
