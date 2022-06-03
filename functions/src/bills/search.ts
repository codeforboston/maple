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
      { name: "primarySponsor", type: "string", facet: true, optional: true }
    ],
    default_sorting_field: "testimonyCount"
  },
  convert: data => {
    const bill = Bill.checkWithDefaults(data)
    return {
      id: bill.id,
      number: bill.id,
      title: bill.content.Title,
      body: bill.content.DocumentText,
      city: bill.city,
      currentCommittee: bill.currentCommittee?.name,
      testimonyCount: bill.testimonyCount,
      primarySponsor: bill.content.PrimarySponsor?.Name
    }
  }
})
