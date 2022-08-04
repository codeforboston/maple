import AddTestimony from "../AddTestimony/AddTestimony"
import { usePublishedTestimonyListing } from "../db"
import TestimoniesTable from "../TestimoniesTable/TestimoniesTable"
import { useCallback } from "react"
import { BillContent } from "../db"

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
      <TestimoniesTable {...testimony} />
      <AddTestimony bill={bill} refreshtable={refreshtable} />
    </>
  )
}
