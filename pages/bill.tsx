import { useRouter } from "next/router"
import { BillDetails } from "../components/bill"
import { createPage } from "../components/page"
import { PublishService } from "../components/publish/PublishService"

export default createPage({
  title: "Bill",
  Page: () => {
    const router = useRouter(),
      id = router.query.id,
      billId = typeof id === "string" ? id : null

    return (
      <>
        <PublishService />
        {billId && <BillDetails billId={billId} />}
      </>
    )
  }
})
