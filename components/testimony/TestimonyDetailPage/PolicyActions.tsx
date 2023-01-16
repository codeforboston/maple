import { Card, ListItem, ListItemProps } from "components/Card"
import { formatBillId } from "components/formatting"
import { formUrl } from "components/publish"
import { FC } from "react"
import { useCurrentTestimonyDetails } from "./testimonyDetailSlice"

const PolicyActionItem: FC<ListItemProps> = props => (
  <ListItem action active={false} variant="secondary" {...props} />
)

export const PolicyActions = () => {
  const { bill } = useCurrentTestimonyDetails(),
    billLabel = formatBillId(bill.id)

  return (
    <Card
      header="Policy Actions"
      items={[
        <PolicyActionItem
          onClick={() => window.alert("TODO")}
          key="follow"
          billName={`Follow ${billLabel}`}
        />,
        <PolicyActionItem
          key="add-testimony"
          billName={`Add Testimony for ${billLabel}`}
          href={formUrl(bill.id, bill.court)}
        />
      ]}
    />
  )
}
