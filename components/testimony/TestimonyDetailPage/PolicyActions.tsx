import { Card, ListItem, ListItemProps } from "components/Card"
import { flags } from "components/featureFlags"
import { formatBillId } from "components/formatting"
import { formUrl } from "components/publish"
import { isNotNull } from "components/utils"
import { FC, ReactElement } from "react"
import { useCurrentTestimonyDetails } from "./testimonyDetailSlice"
import { useTranslation } from "next-i18next"
import { useMediaQuery } from "usehooks-ts"

interface PolicyActionsProps {
  className?: string
  isUser?: boolean
}

const PolicyActionItem: FC<ListItemProps> = props => (
  <ListItem action active={false} variant="secondary" {...props} />
)

export const PolicyActions: FC<PolicyActionsProps> = ({
  className,
  isUser
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)")

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
  //temporary check to hide edit and add testimony in mobile view
  !isMobile &&
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
