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
import { billSearchByTopicLink } from "components/links"

const BillsByTopicContainer = ({
  billGroup,
  selectedFilter,
  court
}: {
  billGroup: BillGroupSummary
  selectedFilter: BillFilter
  court: number
}) => {
  const { t } = useTranslation("legislators")
  const filterLabel =
    selectedFilter === "all"
      ? t("All")
      : selectedFilter === "sponsored"
      ? t("profiles.primarySponsor")
      : t("profiles.coSponsor")

  const topicGroups = billGroup.topics

  return (
    <StyledBillsByTopic>
      <StyledBillsByTopicHeader>
        <StyledBillsByTopicHeaderTitle>
          {t("profiles.billsByTopic")}
        </StyledBillsByTopicHeaderTitle>
        <StyledBillsByTopicHeaderSubtitle>
          {billGroup.count} {t("profiles.bills")} • {filterLabel}
        </StyledBillsByTopicHeaderSubtitle>
      </StyledBillsByTopicHeader>
      <div>
        {topicGroups.map(group => (
          <StyledTopicRow key={group.topic}>
            <StyledTopicMeta>
              <StyledTopicNameBox>
                <StyledTopicName>{group.topic}</StyledTopicName>
              </StyledTopicNameBox>
              <StyledCountLabel>{group.count} bills</StyledCountLabel>
            </StyledTopicMeta>
            <StyledSubtopicContainer>
              {group.subtopics.map(({ topic, count }) => (
                <StyledTopicLink
                  key={topic}
                  href={billSearchByTopicLink(court, {
                    category: group.topic,
                    topic
                  })}
                  aria-label={`${topic} (${count} bills)`}
                >
                  <StyledSubtopicTag>{topic}</StyledSubtopicTag>
                </StyledTopicLink>
              ))}
            </StyledSubtopicContainer>
          </StyledTopicRow>
        ))}
      </div>
    </StyledBillsByTopic>
  )
}

export const BillsByTopic = ({
  summary,
  court
}: {
  summary: MemberBillSummary
  court: number
}) => {
  const [selectedFilter, setSelectedFilter] = useState<BillFilter>("all")
  const selectedGroup = summary[selectedFilter]

  return (
    <>
      <BillFilterButtons
        summary={summary}
        selectedFilter={selectedFilter}
        onSelectFilter={setSelectedFilter}
      />
      <BillsByTopicContainer
        billGroup={selectedGroup}
        selectedFilter={selectedFilter}
        court={court}
      />
    </>
  )
}
