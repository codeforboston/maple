import { useRouter } from "next/router"
import { BillDetails } from "../components/bill"
import { createPage } from "../components/page"
import { usePublishService } from "../components/publish/hooks"

export default createPage({
  title: "Bill",
  Page: () => {
    const router = useRouter(),
      id = router.query.id,
      billId = typeof id === "string" ? id : null

    return (
      <>
        <usePublishService.Provider />
        {billId && <BillDetails billId={billId} />}
      </>
    )
  }
})
