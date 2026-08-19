import AboutPagesCard from "../AboutPagesCard/AboutPagesCard"
import {
  OurGoalsCardContent,
  OurMissionCardContent
} from "../GoalsAndMissionCardContent/GoalsAndMissionCardContent"
import { useTranslation } from "next-i18next"
import LearnBreadcrumb from "../learn/LearnBreadcrumb"
import LearnHeader from "../learn/LearnHeader"
import LearnLayout from "../learn/LearnLayout"

const GoalsAndMission = () => {
  const { t } = useTranslation(["goalsandmission", "common"])
  return (
    <LearnLayout width="medium">
      <LearnBreadcrumb section={t("breadcrumb")} eyebrow={t("common:about")} />
      <LearnHeader title={t("header")} titleSize="2.25rem" />
      <AboutPagesCard title={t("goals.title")}>
        <OurGoalsCardContent />
      </AboutPagesCard>
      <AboutPagesCard title={t("mission.title")}>
        <OurMissionCardContent />
      </AboutPagesCard>
    </LearnLayout>
  )
}

export default GoalsAndMission
