import { useCallback } from "react"
import { BillContent, usePublishedTestimonyListing } from "../db"
import ViewTestimony from "../UserTestimonies/ViewTestimony"

export const BillTestimonies = (props: { bill: BillContent }) => {
  const { bill } = props
  const testimony = usePublishedTestimonyListing({
    billId: bill.BillNumber
  })

  const { items } = testimony

  const refreshtable = useCallback(() => {
    items.execute()
  }, [items])

  return (
    <>
      <ViewTestimony {...testimony} showControls={false} />
    </>
  )
}
