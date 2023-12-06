import { Card, ListItem, ListItemProps } from "components/Card"
import { flags } from "components/featureFlags"
import { formatBillId } from "components/formatting"
import { formUrl } from "components/publish"
import { isNotNull } from "components/utils"
import { FC, ReactElement } from "react"
import { useCurrentTestimonyDetails } from "./testimonyDetailSlice"
import { useTranslation } from "next-i18next"

interface PolicyActionsProps {
  className?: string
  isUser?: boolean
  isReporting: boolean
  setReporting: (boolean: boolean) => void
}

const PolicyActionItem: FC<ListItemProps> = props => (
  <ListItem action active={false} variant="secondary" {...props} />
)

export const PolicyActions: FC<PolicyActionsProps> = ({
  className,
  isUser,
  isReporting,
  setReporting
}) => {
  const { bill } = useCurrentTestimonyDetails(),
    billLabel = formatBillId(bill.id)

  const items: ReactElement[] = []
  if (flags().notifications)
    items.push(
      <PolicyActionItem
        onClick={() => window.alert("TODO")} // TODO: add follow action here
        key="follow"
        billName={`Follow ${billLabel}`}
      />
    )
  items.push(
    <PolicyActionItem
      key="report-testimony"
      billName={`Report Testimony`}
      onClick={() => setReporting(!isReporting)}
    />
  )
  items.push(
    <PolicyActionItem
      key="add-testimony"
      billName={`${isUser ? "Edit" : "Add"} Testimony for ${billLabel}`}
      href={formUrl(bill.id, bill.court)}
    />
  )

  const { t } = useTranslation("testimony")

  return (
    <Card
      className={className}
      header={t("policyActions.actions") ?? "Actions"}
      items={items}
    />
  )
}
