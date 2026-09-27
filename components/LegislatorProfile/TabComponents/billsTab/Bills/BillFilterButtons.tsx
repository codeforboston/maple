import { useTranslation } from "next-i18next"
import {
  StyledButtonFilterGroup,
  StyledButtonBase
} from "../StyledComponents/BillStyledComponents"
import { Bill } from "functions/src/bills/types"

type BillGroups = {
  all: Bill[]
  sponsored: Bill[]
  cosponsored: Bill[]
}

export const BillFilterButtons = ({ bills }: { bills: BillGroups }) => {
  const { t } = useTranslation("legislators")

  const sponsoredBills = bills.sponsored.length
  const coSponsoredBills = bills.cosponsored.length
  const allBills = bills.all.length

  return (
    <StyledButtonFilterGroup>
      <StyledButtonBase>
        <div>{sponsoredBills}</div>
        <div>{t("billsSponsored")}</div>
      </StyledButtonBase>
      <StyledButtonBase>
        <div>{coSponsoredBills}</div>
        <div>{t("cosponsored")}</div>
      </StyledButtonBase>
      <StyledButtonBase>
        <div>{t("All")}</div>
        <div>{allBills}</div>
      </StyledButtonBase>
    </StyledButtonFilterGroup>
  )
}
