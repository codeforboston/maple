import { MemberContent } from "functions/src/members/types"
import { useTranslation } from "next-i18next"
import {
  StyledButtonFilterGroup,
  StyledButtonBase
} from "../StyledComponents/BillStyledComponents"

export const BillFilterButtons = ({
  member
}: {
  member: MemberContent | undefined
}) => {
  const { t } = useTranslation("legislators")

  const sponsoredBills = member?.SponsoredBills?.length ?? 0
  const coSponsoredBills = member?.CoSponsoredBills?.length ?? 0
  const allBills = sponsoredBills + coSponsoredBills

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
