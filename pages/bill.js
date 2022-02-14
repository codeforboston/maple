import { createPage } from "../components/page"
import Bill from "../components/Bill/Bill"
import { useRouter } from "next/router"
import { documents } from "../components/MockAPIResponseDocuments"

export default createPage({
  v2: true,
  title: "Bill",
  Page: () => {
    const router = useRouter(),
      id = router.query.id,
      billId = typeof id === "string" ? id : null

    return billId ? <Bill bill={documents[0]} /> : null
  }
})
