import { BillContent, usePublishedTestimonyListing } from "../db"
import ViewTestimony from "../UserTestimonies/ViewTestimony"

export const BillTestimonies = (props: {
  bill: BillContent
  className?: string
}) => {
  const { bill } = props
  const testimony = usePublishedTestimonyListing({
    billId: bill.BillNumber
  })

  return (
    <>
      <ViewTestimony
        {...testimony}
        showControls={false}
        className={props.className}
      />
    </>
  )
}
