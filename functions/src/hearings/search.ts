import { DateTime } from "luxon"
import { db } from "../firebase"
import { createSearchIndexer } from "../search"
import { Hearing } from "../events/types"
import { timeZone } from "../malegislature"
import { generalCourts, currentGeneralCourt } from "../shared/constants"

type HearingSearchRecord = {
  id: string
  eventId: number
  title: string
  description?: string
  startsAt: number
  month: string
  year: number
  committeeCode?: string
  committeeName?: string
  locationName?: string
  locationCity?: string
  chairNames: string[]
  agendaTopics: string[]
  billNumbers: string[]
  billSlugs: string[]
  court: number
  hasVideo: boolean
}

export const {
  syncToSearchIndex: syncHearingToSearchIndex,
  upgradeSearchIndex: upgradeHearingSearchIndex
} = createSearchIndexer<HearingSearchRecord>({
  sourceCollection: db.collection("events").where("type", "==", "hearing"),
  documentTrigger: "events/{eventId}",
  alias: "hearings",
  idField: "id",
  filter: data => data.type === "hearing",
  schema: {
    fields: [
      { name: "eventId", type: "int32", facet: false },
      { name: "title", type: "string", facet: false },
      { name: "description", type: "string", facet: false, optional: true },
      { name: "startsAt", type: "int64", facet: false },
      { name: "month", type: "string", facet: true },
      { name: "year", type: "int32", facet: true },
      { name: "committeeCode", type: "string", facet: true, optional: true },
      { name: "committeeName", type: "string", facet: true, optional: true },
      { name: "locationName", type: "string", facet: false, optional: true },
      { name: "locationCity", type: "string", facet: false, optional: true },
      { name: "chairNames", type: "string[]", facet: true },
      { name: "agendaTopics", type: "string[]", facet: false },
      { name: "billNumbers", type: "string[]", facet: false },
      { name: "billSlugs", type: "string[]", facet: false },
      { name: "court", type: "int32", facet: true },
      { name: "hasVideo", type: "bool", facet: true }
    ],
    default_sorting_field: "startsAt"
  },
  convert: data => {
    const hearing = Hearing.check(data)
    const { content, startsAt: startsAtTimestamp, id, videoURL } = hearing
    const startsAt = startsAtTimestamp.toMillis()
    const schedule = DateTime.fromMillis(startsAt, { zone: timeZone })

    const agendaTopics = (content.HearingAgendas ?? [])
      .map(agenda => agenda.Topic)
      .filter((topic): topic is string => Boolean(topic))

    const billEntries = (content.HearingAgendas ?? [])
      .flatMap(({ DocumentsInAgenda }) =>
        (DocumentsInAgenda ?? []).map(doc => ({
          number: doc.BillNumber,
          slug:
            doc.BillNumber && doc.GeneralCourtNumber
              ? `${doc.GeneralCourtNumber}/${doc.BillNumber}`
              : ""
        }))
      )
      .filter(entry => Boolean(entry.number))

    const dedupedBills: { number: string; slug: string }[] = []
    const seenBillKeys = new Set<string>()

    for (const entry of billEntries) {
      const key = entry.slug || entry.number
      if (seenBillKeys.has(key)) continue
      seenBillKeys.add(key)
      dedupedBills.push(entry)
    }

    const committeeName = content.Name
    const courtEntry =
      Object.values(generalCourts).find(
        (court): court is NonNullable<typeof court> =>
          Boolean(court) &&
          schedule.year >= court!.FirstYear &&
          schedule.year <= court!.SecondYear
      ) ?? generalCourts[currentGeneralCourt]
    const courtNumber = courtEntry?.Number ?? currentGeneralCourt
    return {
      id: id,
      eventId: content.EventId,
      title: committeeName ?? `Hearing ${content.EventId}`,
      description: content.Description,
      startsAt,
      month: schedule.toFormat("LLLL"),
      year: schedule.year,
      committeeCode: content.HearingHost?.CommitteeCode ?? undefined,
      committeeName: committeeName ?? undefined,
      locationName: content.Location?.LocationName ?? undefined,
      locationCity: content.Location?.City ?? undefined,
      chairNames: hearing.committeeChairs ?? [],
      agendaTopics,
      billNumbers: dedupedBills.map(bill => bill.number),
      billSlugs: dedupedBills.map(
        bill => bill.slug || `${courtNumber}/${bill.number}`
      ),
      court: courtNumber,
      hasVideo: Boolean(videoURL)
    }
  }
})
