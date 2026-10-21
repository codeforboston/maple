import { useTranslation } from "next-i18next"
import {
  StyledButtonFilterGroup,
  StyledButtonBase
} from "../StyledComponents/BillStyledComponents"
import { BillGroupSummary } from "functions/src/members/memberBillSummary"

export type BillFilter = "all" | "sponsored" | "cosponsored"

export const BillFilterButtons = ({
  groups,
  selectedFilter,
  onSelectFilter
}: {
  groups: Record<BillFilter, BillGroupSummary>
  selectedFilter: BillFilter
  onSelectFilter: (filter: BillFilter) => void
}) => {
  const { t } = useTranslation("legislators")

  const sponsoredBills = groups.sponsored.count
  const coSponsoredBills = groups.cosponsored.count
  const allBills = groups.all.count

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
