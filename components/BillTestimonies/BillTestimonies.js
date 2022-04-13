import AddTestimony from "../AddTestimony/AddTestimony"
import { usePublishedTestimonyListing } from "../db"
import TestimoniesTable from "../TestimoniesTable/TestimoniesTable"
import { useCallback } from "react"

// the word "testimonies": In more general, commonly used, contexts, the plural form will also be testimony.  However, in more specific contexts, the plural form can also be testimonies e.g. in reference to various types of testimonies or a collection of testimonies.

const BillTestimonies = props => {
  const { bill } = props
  const { items } = usePublishedTestimonyListing({
    billId: bill.BillNumber
  })
  const testimonies =
    items.status == "success" ? items.result : []

  const refreshtable = useCallback(() => {
    items.execute()
  }, [items])

  return (
    <>
      <TestimoniesTable testimonies={testimonies} />
      <AddTestimony bill={bill} refreshtable={refreshtable} />
    </>
  )
}

export default BillTestimonies
