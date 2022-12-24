import { Card, ListItem } from "components/Card"
import { formatBillId } from "components/formatting"
import { useTestimonyDetails } from "./testimonyDetailSlice"

export const PolicyActions = () => {
  const { bill } = useTestimonyDetails(),
    billId = formatBillId(bill.id)

  return (
    <Card
      header="Policy Actions"
      items={[
        <ListItem key="follow" billName={`Follow ${billId}`} />,
        <ListItem
          key="add-testimony"
          billName={`Add Testimony for ${billId}`}
        />
      ]}
    />
  )
}
