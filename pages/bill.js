import { createPage } from "../components/page"
import Bill from "../components/Bill/Bill"
import { useRouter } from "next/router"

export default createPage({
  v2: true,
  title: "Bill",
  Page: () => {
    const router = useRouter(),
      id = router.query.id,
      billId = typeof id === "string" ? id : null

    return billId ? <Bill billId={billId} /> : null
  }
})
