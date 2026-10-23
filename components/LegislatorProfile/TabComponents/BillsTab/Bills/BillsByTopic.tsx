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
import { Bill } from "functions/src/bills/types"
import { BillFilter, BillFilterButtons } from "./BillFilterButtons"
import { billSearchByTopicLink } from "components/links"

type BillGroups = {
  all: Bill[]
  sponsored: Bill[]
  cosponsored: Bill[]
}

type TopicGroupAccumulator = {
  category: string
  count: number
  subtopics: Record<string, number>
}

const BillsByTopicContainer = ({
  bills,
  selectedFilter,
  court
}: {
  bills: Bill[]
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

  const topicGroups = Object.values(
    bills.reduce<Record<string, TopicGroupAccumulator>>((groups, bill) => {
      const categoriesSeen = new Set<string>()
      const topicsSeen = new Set<string>()

      for (const { category, topic } of bill.topics ?? []) {
        const group = groups[category] ?? {
          category,
          count: 0,
          subtopics: {}
        }

        if (!categoriesSeen.has(category)) {
          group.count += 1
          categoriesSeen.add(category)
        }

        if (!topicsSeen.has(`${category}\u0000${topic}`)) {
          group.subtopics[topic] = (group.subtopics[topic] ?? 0) + 1
          topicsSeen.add(`${category}\u0000${topic}`)
        }
        groups[category] = group
      }

      return groups
    }, {})
  )
    .sort((groupA, groupB) => groupB.count - groupA.count)
    .slice(0, 5)
    .map(group => ({
      ...group,
      subtopics: Object.entries(group.subtopics)
        .map(([topic, count]) => ({ topic, count }))
        .sort((topicA, topicB) => topicB.count - topicA.count)
        .slice(0, 4)
    }))

  return (
    <StyledBillsByTopic>
      <StyledBillsByTopicHeader>
        <StyledBillsByTopicHeaderTitle>
          {t("profiles.billsByTopic")}
        </StyledBillsByTopicHeaderTitle>
        <StyledBillsByTopicHeaderSubtitle>
          {bills.length} {t("profiles.bills")} • {filterLabel}
        </StyledBillsByTopicHeaderSubtitle>
      </StyledBillsByTopicHeader>
      <div>
        {topicGroups.map(group => (
          <StyledTopicRow key={group.category}>
            <StyledTopicMeta>
              <StyledTopicNameBox>
                <StyledTopicName>{group.category}</StyledTopicName>
              </StyledTopicNameBox>
              <StyledCountLabel>{group.count} bills</StyledCountLabel>
            </StyledTopicMeta>
            <StyledSubtopicContainer>
              {group.subtopics.map(({ topic, count }) => (
                <StyledTopicLink
                  key={topic}
                  href={billSearchByTopicLink(court, {
                    category: group.category,
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
  billGroups,
  court
}: {
  billGroups: BillGroups
  court: number
}) => {
  const [selectedFilter, setSelectedFilter] = useState<BillFilter>("all")
  const selectedBills = billGroups[selectedFilter]

  return (
    <>
      <BillFilterButtons
        bills={billGroups}
        selectedFilter={selectedFilter}
        onSelectFilter={setSelectedFilter}
      />
      <BillsByTopicContainer
        bills={selectedBills}
        selectedFilter={selectedFilter}
        court={court}
      />
    </>
  )
}
