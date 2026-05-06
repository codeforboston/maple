import { useTranslation } from "next-i18next"
import { useEffect, useState } from "react"
import { Spinner } from "react-bootstrap"

import { LegislatorPage } from "components/legislator"
import { createPage } from "components/page"
import { createGetStaticTranslationProps } from "components/translations"

export default createPage<{ court: string }>({
  titleI18nKey: "navigation.legislator",
  Page: () => {
    const { id, loading } = useProfileRouting()
    const { t } = useTranslation("profile")

    return (
      <div>
        {loading ? (
          <div className={`d-grid place-content-center`}>
            <Spinner animation={"border"} />
          </div>
        ) : id ? (
          <LegislatorPage id={id} />
        ) : (
          <div>{t("noUser")}</div>
        )}
      </div>
    )
  }
})

const useProfileRouting = () => {
  const [id, setId] = useState<string>("od")
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (window) {
      const urlParams = new URLSearchParams(window.location?.search)
      const urlid = urlParams.get("id")

      if (typeof urlid === "string") {
        setId(urlid)
      }
      if (urlid !== undefined) {
        setLoading(false)
      }
    }
  }, [id])

  return { id, loading }
}

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "footer",
  "legislators",
  "profile",
  "testimony"
])
