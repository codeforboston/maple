import { db } from "../firebase"
import {
  billNumberVariants,
  billNumberVariantsVersion
} from "../bills/numberVariants"
import { createSearchIndexer } from "../search"
import { Testimony, TestimonySearchRecord } from "./types"

export const {
  syncToSearchIndex: syncTestimonyToSearchIndex,
  upgradeSearchIndex: upgradeTestimonySearchIndex,
  runBackfillChunk: runTestimonyBackfillChunk
} = createSearchIndexer<TestimonySearchRecord>({
  sourceCollection: db.collectionGroup("publishedTestimony"),
  documentTrigger: "users/{uid}/publishedTestimony/{id}",
  alias: "publishedTestimony",
  idField: "id",
  convertVersion: billNumberVariantsVersion,
  schema: {
    /** Hyphens do not split tokens by default, so "vote-by-mail" indexes as one
     * token and the spaced form people type cannot reach it — the two spellings
     * return disjoint result sets. Splitting on "-" makes each form find both,
     * and makes the parts individually searchable ("income" reaches
     * "low-income"). Hyphenated compounds are everywhere in this corpus:
     * low-income, long-term, well-being, community-based, in-person.
     */
    token_separators: ["-"],
    fields: [
      { name: "billId", type: "string", facet: true },
      { name: "billIdVariants", type: "string[]", facet: false },
      { name: "court", type: "int32", facet: true },
      { name: "position", type: "string", facet: true },
      { name: "content", type: "string", facet: false },
      { name: "authorUid", type: "string", facet: false },
      { name: "authorRole", type: "string", facet: true },
      { name: "authorDisplayName", type: "string", facet: true },
      { name: "fullName", type: "string", facet: false },
      { name: "version", type: "int32", facet: false },
      { name: "public", type: "bool", facet: false },
      { name: "publishedAt", type: "int64", facet: false },
      { name: "updatedAt", type: "int64", facet: false }
    ],
    default_sorting_field: "publishedAt"
  },
  filter: data => !data.ballotQuestionId,
  convert: data => {
    const validation = Testimony.validateWithDefaults(data)
    if (!validation.success) {
      console.error(data, validation.message, validation.details)
      throw new Error("Invalid testimony")
    }
    const testimony = validation.value
    const record: TestimonySearchRecord = {
      id: testimony.id,
      billId: testimony.billId,
      billIdVariants: billNumberVariants(testimony.billId),
      authorDisplayName: testimony.authorDisplayName,
      court: testimony.court,
      position: testimony.position,
      content: testimony.content,
      authorUid: testimony.authorUid,
      authorRole: testimony.authorRole,
      version: testimony.version,
      publishedAt: testimony.publishedAt.toMillis(),
      updatedAt: testimony.updatedAt.toMillis(),
      fullName: testimony.fullName,
      public: testimony.public
    }
    return TestimonySearchRecord.check(record)
  }
})
