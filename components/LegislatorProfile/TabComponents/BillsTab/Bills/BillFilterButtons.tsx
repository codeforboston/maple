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

export type BillFilter = keyof BillGroups

export const BillFilterButtons = ({
  bills,
  selectedFilter,
  onSelectFilter
}: {
  bills: BillGroups
  selectedFilter: BillFilter
  onSelectFilter: (filter: BillFilter) => void
}) => {
  const { t } = useTranslation("legislators")

  const sponsoredBills = bills.sponsored.length
  const coSponsoredBills = bills.cosponsored.length
  const allBills = bills.all.length

  return (
    <StyledButtonFilterGroup>
      <StyledButtonBase
        type="button"
        $selected={selectedFilter === "sponsored"}
        aria-pressed={selectedFilter === "sponsored"}
        onClick={() => onSelectFilter("sponsored")}
      >
        <div>{sponsoredBills}</div>
        <div>{t("billsSponsored")}</div>
      </StyledButtonBase>
      <StyledButtonBase
        type="button"
        $selected={selectedFilter === "cosponsored"}
        aria-pressed={selectedFilter === "cosponsored"}
        onClick={() => onSelectFilter("cosponsored")}
      >
        <div>{coSponsoredBills}</div>
        <div>{t("cosponsored")}</div>
      </StyledButtonBase>
      <StyledButtonBase
        type="button"
        $selected={selectedFilter === "all"}
        aria-pressed={selectedFilter === "all"}
        onClick={() => onSelectFilter("all")}
      >
        <div>{t("All")}</div>
        <div>{allBills}</div>
      </StyledButtonBase>
    </StyledButtonFilterGroup>
  )
}
