import { DateTime } from "luxon"
import { db } from "../firebase"
import { createSearchIndexer } from "../search"
import { Hearing } from "../events/types"
import { timeZone } from "../malegislature"

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
  chairNames?: string[]
  agendaTopics: string[]
  billNumbers: string[]
  billSlugs: string[]
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
      { name: "chairNames", type: "string[]", facet: true, optional: true },
      { name: "agendaTopics", type: "string[]", facet: false, optional: true },
      { name: "billNumbers", type: "string[]", facet: false, optional: true },
      { name: "billSlugs", type: "string[]", facet: false, optional: true },
      { name: "hasVideo", type: "bool", facet: true }
    ],
    default_sorting_field: "startsAt"
  },
  convert: data => {
    const {
      content,
      startsAt: startsAtTimestamp,
      id,
      videoURL,
      committeeChairNames
    } = Hearing.check(data)
    const startsAt = startsAtTimestamp.toMillis()
    const schedule = DateTime.fromMillis(startsAt, { zone: timeZone })
    const bills = content.HearingAgendas?.flatMap(({ DocumentsInAgenda }) =>
      DocumentsInAgenda.map(doc => ({
        number: doc.BillNumber,
        slug: `${doc.GeneralCourtNumber}/${doc.BillNumber}`
      }))
    )
    const committeeName = content.Name
    return {
      id: id,
      eventId: content.EventId,
      title: committeeName ?? `Hearing ${content.EventId}`,
      description: content.Description,
      startsAt,
      month: schedule.toFormat("LLLL"),
      year: schedule.year,
      committeeCode: content.HearingHost?.CommitteeCode,
      committeeName,
      locationName: content.Location?.LocationName,
      locationCity: content.Location?.City,
      chairNames: committeeChairNames,
      agendaTopics: content.HearingAgendas.map(agenda => agenda.Topic),
      billNumbers: bills.map(bill => bill.number),
      billSlugs: bills.map(bill => bill.slug),
      hasVideo: Boolean(videoURL)
    }
  }
})
