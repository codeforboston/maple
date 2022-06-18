import { isString } from "lodash"
import { db } from "../firebase"
import { currentGeneralCourt } from "../malegislature"
import { createSearchIndexer } from "../search"
import { Bill } from "./types"

export const {
  syncToSearchIndex: syncBillToSearchIndex,
  upgradeSearchIndex: upgradeBillSearchIndex
} = createSearchIndexer({
  sourceCollection: db.collection(
    `/generalCourts/${currentGeneralCourt}/bills`
  ),
  idField: "id",
  alias: "bills",
  schema: {
    fields: [
      { name: "number", type: "string", facet: false },
      { name: "title", type: "string", facet: false },
      { name: "body", type: "string", facet: false, optional: true },
      { name: "city", type: "string", facet: true, optional: true },
      { name: "currentCommittee", type: "string", facet: true, optional: true },
      { name: "testimonyCount", type: "int32" },
      { name: "primarySponsor", type: "string", facet: true, optional: true },
      {
        name: "cosponsors",
        type: "string[]",
        facet: true
      },
      { name: "cosponsorCount", type: "int32" },
      { name: "nextHearingAt", type: "int64", optional: true },
      { name: "latestTestimonyAt", type: "int64", optional: true },

      { name: "endorseCount", type: "int32" },
      { name: "opposeCount", type: "int32" },
      { name: "neutralCount", type: "int32" }
    ],
    default_sorting_field: "testimonyCount"
  },
  convert: data => {
    const validation = Bill.validateWithDefaults(data)
    if (!validation.success) {
      console.error(data, validation.message, validation.details)
    }
    const bill = Bill.checkWithDefaults(data)
    return {
      id: bill.id,
      number: bill.id,
      title: bill.content.Title,
      body: bill.content.DocumentText,
      city: bill.city,
      currentCommittee: bill.currentCommittee?.name,
      testimonyCount: bill.testimonyCount,
      primarySponsor: bill.content.PrimarySponsor?.Name,
      cosponsors: bill.content.Cosponsors.map(m => m.Name).filter(isString),
      cosponsorCount: bill.content.Cosponsors.length,
      nextHearingAt: bill.nextHearingAt?.toMillis(),
      latestTestimonyAt: bill.latestTestimonyAt?.toMillis(),
      endorseCount: bill.endorseCount,
      opposeCount: bill.opposeCount,
      neutralCount: bill.neutralCount
    }
  }
})
