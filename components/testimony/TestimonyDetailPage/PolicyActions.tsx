import { Card, ListItem, ListItemProps } from "components/Card"
import { flags } from "components/featureFlags"
import { formatBillId } from "components/formatting"
import { formUrl } from "components/publish"
import { isNotNull } from "components/utils"
import { FC, ReactElement } from "react"
import { useCurrentTestimonyDetails } from "./testimonyDetailSlice"

const PolicyActionItem: FC<ListItemProps> = props => (
  <ListItem action active={false} variant="secondary" {...props} />
)

export const PolicyActions: FC<{ className?: string }> = ({ className }) => {
  const { bill } = useCurrentTestimonyDetails(),
    billLabel = formatBillId(bill.id)

  const items: ReactElement[] = []
  if (flags().notifications)
    items.push(
      <PolicyActionItem
        onClick={() => window.alert("TODO")}
        key="follow"
        billName={`Follow ${billLabel}`}
      />
    )

  items.push(
    <PolicyActionItem
      key="add-testimony"
      billName={`Add Testimony for ${billLabel}`}
      href={formUrl(bill.id, bill.court)}
    />
  )

  return <Card className={className} header="Actions" items={items} />
}
