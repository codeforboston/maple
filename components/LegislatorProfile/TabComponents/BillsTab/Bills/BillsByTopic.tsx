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
import { billSearchByTopicLinkAndPrimarySponsor } from "components/links"
import { MemberContent } from "components/db"

const BillsByTopicContainer = ({
  billGroup,
  selectedFilter,
  court,
  member
}: {
  billGroup: BillGroupSummary
  selectedFilter: BillFilter
  court: number
  member: MemberContent
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
                  href={billSearchByTopicLinkAndPrimarySponsor(
                    court,
                    {
                      category: group.topic,
                      topic
                    },
                    member
                  )}
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
  court,
  member
}: {
  summary: MemberBillSummary
  court: number
  member: MemberContent
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
        member={member}
      />
    </>
  )
}
