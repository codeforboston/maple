import { useState } from "react"
import { useTranslation } from "next-i18next"
import {
  StyledBillsByTopic,
  StyledBillsByTopicHeader,
  StyledBillsByTopicHeaderSubtitle,
  StyledBillsByTopicHeaderTitle,
  StyledCountLabel,
  StyledSubtopicContainer,
  StyledTopicMeta,
  StyledTopicName,
  StyledTopicRow,
  StyledSubtopicTag,
  StyledTopicNameBox,
  StyledTopicLink
} from "../StyledComponents/BillStyledComponents"
import {
  BillGroupSummary,
  MemberBillSummary
} from "functions/src/members/memberBillSummary"
import { BillFilter, BillFilterButtons } from "./BillFilterButtons"
import { ArrowRightIcon } from "components/learn/icons"

const BillsByTopicContainer = ({
  group,
  selectedFilter
}: {
  group: BillGroupSummary
  selectedFilter: BillFilter
}) => {
  const { t } = useTranslation("legislators")
  const arrow = <ArrowRightIcon sx={{ fontSize: "1.125rem" }} />
  const filterLabel =
    selectedFilter === "all"
      ? t("All")
      : selectedFilter === "sponsored"
      ? t("profiles.primarySponsor")
      : t("profiles.coSponsor")

  return (
    <StyledBillsByTopic>
      <StyledBillsByTopicHeader>
        <StyledBillsByTopicHeaderTitle>
          {t("profiles.billsByTopic")}
        </StyledBillsByTopicHeaderTitle>
        <StyledBillsByTopicHeaderSubtitle>
          {group.count} {t("profiles.bills")} • {filterLabel}
        </StyledBillsByTopicHeaderSubtitle>
      </StyledBillsByTopicHeader>
      <div>
        {group.topics.map(topicGroup => (
          <StyledTopicRow key={topicGroup.topic}>
            <StyledTopicMeta>
              <StyledTopicNameBox>
                <StyledTopicName>{topicGroup.topic}</StyledTopicName>
                <StyledTopicLink>Browse bills {arrow}</StyledTopicLink>
              </StyledTopicNameBox>
              <StyledCountLabel>{topicGroup.count} bills</StyledCountLabel>
            </StyledTopicMeta>
            <StyledSubtopicContainer>
              {topicGroup.subtopics.map(subtopic => (
                <StyledSubtopicTag key={subtopic.topic}>
                  {subtopic.topic}
                </StyledSubtopicTag>
              ))}
            </StyledSubtopicContainer>
          </StyledTopicRow>
        ))}
      </div>
    </StyledBillsByTopic>
  )
}

export const BillsByTopic = ({
  billGroups
}: {
  billGroups: Pick<MemberBillSummary, "all" | "sponsored" | "cosponsored">
}) => {
  const [selectedFilter, setSelectedFilter] = useState<BillFilter>("all")
  const selectedGroup = billGroups[selectedFilter]

  return (
    <>
      <BillFilterButtons
        groups={billGroups}
        selectedFilter={selectedFilter}
        onSelectFilter={setSelectedFilter}
      />
      <BillsByTopicContainer
        group={selectedGroup}
        selectedFilter={selectedFilter}
      />
    </>
  )
}
