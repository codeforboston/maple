export type BillTopicSummary = {
  topic: string
  count: number
  subtopics: { topic: string; count: number }[]
}

export type BillGroupSummary = {
  count: number
  topics: BillTopicSummary[]
}

export type RecentSponsoredBill = {
  id: string
  title: string
  topic: string
}

export type MemberBillSummary = {
  schemaVersion: 2
  all: BillGroupSummary
  sponsored: BillGroupSummary
  cosponsored: BillGroupSummary
  recentSponsoredBills: RecentSponsoredBill[]
}

export type MemberBillSummaryInput = {
  id: string
  content: { Title: string }
  topics?: { category: string; topic: string }[]
}

export function buildMemberBillSummary(
  sponsoredBillIds: string[],
  cosponsoredBillIds: string[],
  bills: MemberBillSummaryInput[]
): MemberBillSummary {
  const sponsoredIds = new Set(sponsoredBillIds)
  const cosponsoredIds = new Set(cosponsoredBillIds)
  const billById = new Map(bills.map(bill => [bill.id, bill]))
  const allIds = new Set([...sponsoredIds, ...cosponsoredIds])
  const allBills = getBills(allIds, billById)
  const sponsoredBills = getBills(sponsoredIds, billById)
  const cosponsoredBills = getBills(
    new Set([...cosponsoredIds].filter(id => !sponsoredIds.has(id))),
    billById
  )

  return {
    schemaVersion: 2,
    all: summarizeGroup(allBills),
    sponsored: summarizeGroup(sponsoredBills),
    cosponsored: summarizeGroup(cosponsoredBills),
    recentSponsoredBills: [...sponsoredBills]
      .sort(compareBillIdsDescending)
      .slice(0, 5)
      .map(bill => ({
        id: bill.id,
        title: bill.content.Title,
        topic: bill.topics?.[1]?.topic ?? ""
      }))
  }
}

function getBills(
  ids: Set<string>,
  billsById: Map<string, MemberBillSummaryInput>
): MemberBillSummaryInput[] {
  return [...ids]
    .map(id => billsById.get(id))
    .filter((bill): bill is MemberBillSummaryInput => bill !== undefined)
}

function summarizeGroup(bills: MemberBillSummaryInput[]): BillGroupSummary {
  const groups = new Map<
    string,
    { count: number; subtopics: Map<string, number> }
  >()

  for (const bill of bills) {
    const categoriesSeen = new Set<string>()
    const topicsSeen = new Set<string>()

    for (const { category, topic } of bill.topics ?? []) {
      const group = groups.get(category) ?? {
        count: 0,
        subtopics: new Map<string, number>()
      }

      if (!categoriesSeen.has(category)) {
        group.count += 1
        categoriesSeen.add(category)
      }

      if (!topicsSeen.has(`${category}\u0000${topic}`)) {
        group.subtopics.set(topic, (group.subtopics.get(topic) ?? 0) + 1)
        topicsSeen.add(`${category}\u0000${topic}`)
      }

      groups.set(category, group)
    }
  }

  const topics = [...groups]
    .map(([topic, group]) => ({
      topic,
      count: group.count,
      subtopics: [...group.subtopics]
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 4)
        .map(([subtopic, count]) => ({ topic: subtopic, count }))
    }))
    .sort((groupA, groupB) => groupB.count - groupA.count)
    .slice(0, 5)

  return { count: bills.length, topics }
}

function compareBillIdsDescending(
  billA: MemberBillSummaryInput,
  billB: MemberBillSummaryInput
): number {
  const numberA = Number(billA.id.match(/(\d+)$/)?.[1])
  const numberB = Number(billB.id.match(/(\d+)$/)?.[1])

  if (Number.isFinite(numberA) && Number.isFinite(numberB)) {
    return numberB - numberA || billB.id.localeCompare(billA.id)
  }

  return billB.id.localeCompare(billA.id)
}
