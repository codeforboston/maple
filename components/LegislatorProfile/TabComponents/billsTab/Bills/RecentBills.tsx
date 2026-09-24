import { TabBlock } from "components/LegislatorProfile/LegislatorComponents"
import { useTranslation } from "next-i18next"
import { StyledSubSectionHeaders } from "../StyledComponents/BillStyledComponents"

export const RecentBills = () => {
  const { t } = useTranslation("legislators")

  return (
    <div>
      <StyledSubSectionHeaders>
        {t("profiles.recentSponsoredBills.header")}
      </StyledSubSectionHeaders>
      <TabBlock>Body</TabBlock>
    </div>
  )
}
