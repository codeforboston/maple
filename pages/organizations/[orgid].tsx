import { dbService } from "components/db/api"
import { useState, useEffect } from "react"
import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import { ProfilePage } from "components/ProfilePage"
import { createPage } from "../../components/page"

export default createPage({
  titleI18nKey: "orgs",
  Page: () => {
    const id = useOrgRouting()

    return (
      <>
        <ProfilePage id={id} verifyisorg={true} />
      </>
    )
  }
})

const useOrgRouting = () => {
  const router = useRouter()
  const { userLookup } = router.query
  const [id, setId] = useState<string>("")

  useEffect(() => {
    if (typeof userLookup === "string") {
      setId(userLookup)
    }
  }, [id, userLookup])

  return id
}
