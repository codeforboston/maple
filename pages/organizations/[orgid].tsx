import { dbService } from "components/db/api"
import { useState, useEffect } from "react"
import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import { ProfilePage } from "components/ProfilePage/ProfilePage" 
import { createPage } from "../../components/page"

export default createPage({
  title: "Organizations",
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
    const { orgid } = router.query
    const [id, setId] = useState<string>("")

    useEffect(() => {
        if (typeof orgid === "string") {
            setId(orgid)
        }

    }, [id, orgid])


    return id  
}

