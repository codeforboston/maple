import { MemberContent } from "functions/src/members/types"
import { useTranslation } from "next-i18next"
import { useState, useEffect } from "react"
import {
  collection,
  query,
  where,
  getDocs,
  getFirestore
} from "firebase/firestore"
import {
  StyledBillsByTopic,
  StyledBillsByTopicHeader,
  StyledBillsByTopicHeaderSubtitle,
  StyledBillsByTopicHeaderTitle
} from "../StyledComponents/BillStyledComponents"

export const BillsByTopic = ({
  member
}: {
  member: MemberContent | undefined
}) => {
  const { t } = useTranslation("legislators")
  const [topFiveTopics, setTopFiveTopics] = useState<
    { topic: string; count: number }[]
  >([])

  useEffect(() => {
    if (!member?.MemberCode || !member.GeneralCourtNumber) {
      setTopFiveTopics([])
      return
    }

    const loadBillsByTopic = async () => {
      try {
        const firestore = getFirestore()
        const billsRef = collection(
          firestore,
          `generalCourts/${member.GeneralCourtNumber}/bills`
        )

        const q = query(
          billsRef,
          where("content.PrimarySponsor.Id", "==", member.MemberCode)
        )

        const querySnapshot = await getDocs(q)
        const topicCounts: Record<string, number> = {}

        querySnapshot.forEach(doc => {
          const bill = doc.data()
          const primaryTopic = bill.topics?.[0]?.topic ?? "Uncategorized"

          topicCounts[primaryTopic] = (topicCounts[primaryTopic] || 0) + 1
        })

        setTopFiveTopics(
          Object.entries(topicCounts)
            .map(([topic, count]) => ({ topic, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
        )
      } catch (error) {
        console.error("Unable to load bills by topic:", error)
        setTopFiveTopics([])
      }
    }

    void loadBillsByTopic()
  }, [member?.MemberCode, member?.GeneralCourtNumber])

  return (
    <StyledBillsByTopic>
      <StyledBillsByTopicHeader>
        <StyledBillsByTopicHeaderTitle>
          {t("profiles.billsByTopic")}
        </StyledBillsByTopicHeaderTitle>
        <StyledBillsByTopicHeaderSubtitle>
          {topFiveTopics.reduce((total, item) => total + item.count, 0)}{" "}
          {t("profiles.bills")} • {t("profiles.primarySponsor")}
        </StyledBillsByTopicHeaderSubtitle>
      </StyledBillsByTopicHeader>
    </StyledBillsByTopic>
  )
}
