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
  StyledSubtopicTag
} from "../StyledComponents/BillStyledComponents"
import { Bill } from "functions/src/bills/types"
import { BillFilterButtons } from "./BillFilterButtons"

type BillGroups = {
  all: Bill[]
  sponsored: Bill[]
  cosponsored: Bill[]
}

type TopicGroup = {
  topic: string
  count: number
  bills: Bill[]
}

const BillsByTopicContainer = ({ bills }: { bills: Bill[] }) => {
  const { t } = useTranslation("legislators")

  const topicGroups = Object.values(
    bills.reduce<Record<string, TopicGroup>>((groups, bill) => {
      const topic = bill.topics?.[0]?.topic

      if (topic) {
        const group = groups[topic] ?? { topic, count: 0, bills: [] }
        group.count += 1
        group.bills.push(bill)
        groups[topic] = group
      }

      return groups
    }, {})
  )
    .sort((groupA, groupB) => groupB.count - groupA.count)
    .slice(0, 5)
    .map(group => ({
      ...group,
      subtopics: Object.entries(
        group.bills.reduce<Record<string, number>>((counts, bill) => {
          const subtopic = bill.topics?.[1]?.topic

          if (subtopic) {
            counts[subtopic] = (counts[subtopic] ?? 0) + 1
          }

          return counts
        }, {})
      )
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 4)
    }))

  return (
    <StyledBillsByTopic>
      <StyledBillsByTopicHeader>
        <StyledBillsByTopicHeaderTitle>
          {t("profiles.billsByTopic")}
        </StyledBillsByTopicHeaderTitle>
        <StyledBillsByTopicHeaderSubtitle>
          {bills.length} {t("profiles.bills")} • {t("profiles.primarySponsor")}
        </StyledBillsByTopicHeaderSubtitle>
      </StyledBillsByTopicHeader>
      <div>
        {topicGroups.map(group => (
          <StyledTopicRow key={group.topic}>
            <StyledTopicMeta>
              <StyledTopicName>{group.topic}</StyledTopicName>
              <StyledCountLabel>{group.count} bills</StyledCountLabel>
            </StyledTopicMeta>
            <StyledSubtopicContainer>
              {group.subtopics.map(([subtopic]) => (
                <StyledSubtopicTag key={subtopic}>{subtopic}</StyledSubtopicTag>
              ))}
            </StyledSubtopicContainer>
          </StyledTopicRow>
        ))}
      </div>
    </StyledBillsByTopic>
  )
}

export const BillsByTopic = ({
  bills,
  billGroups
}: {
  bills: Bill[]
  billGroups: BillGroups
}) => {
  return (
    <>
      <BillFilterButtons bills={billGroups} />
      <BillsByTopicContainer bills={bills} />
    </>
  )
}
