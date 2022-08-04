import { useRouter } from "next/router"
import { BillDetails } from "../components/bill"
import { createPage } from "../components/page"

export default createPage({
  title: "Bill",
  Page: () => {
    const router = useRouter(),
      id = router.query.id,
      billId = typeof id === "string" ? id : null

    return billId ? <BillDetails billId={billId} /> : null
  }
})
