import { useTranslation } from "next-i18next"
import {
  StyledSubSectionHeaders,
  StyledSubsectionTable
} from "../StyledComponents/BillStyledComponents"
import { TabBlock } from "components/LegislatorProfile/LegislatorComponents"

export const CommitteePositions = () => {
  const { t } = useTranslation("legislators")

  return (
    <div>
      <StyledSubSectionHeaders>
        {t("profiles.committeePositions.header")}
      </StyledSubSectionHeaders>
      <TabBlock>
        <StyledSubsectionTable></StyledSubsectionTable>
      </TabBlock>
    </div>
  )
}
