import { MemberContent } from "functions/src/members/types"
import { useTranslation } from "next-i18next"
import {
  StyledBillsByTopic,
  StyledBillsByTopicHeader,
  StyledBillsByTopicHeaderSubtitle,
  StyledBillsByTopicHeaderTitle
} from "../StyledComponents/BillStyledComponents"
import { Bill } from "functions/src/bills/types"

type TopicGroup = {
  topic: string
  count: number
  bills: Bill[]
}

export const BillsByTopic = ({
  member,
  bills
}: {
  member: MemberContent | undefined
  bills: Bill[]
}) => {
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
          {t("profiles.bills")} • {t("profiles.primarySponsor")}
        </StyledBillsByTopicHeaderSubtitle>
        <div>
          {topicGroups.map(group => (
            <div key={group.topic}>
              <p>
                {group.topic}: {group.count}
              </p>
              {group.subtopics.map(([subtopic, count]) => (
                <p key={subtopic}>
                  {subtopic}: {count}
                </p>
              ))}
            </div>
          ))}
        </div>
      </StyledBillsByTopicHeader>
    </StyledBillsByTopic>
  )
}
