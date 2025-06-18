import { db } from "../firebase"
import { createSearchIndexer } from "../search"
import {
  Testimony,
  TestimonySearchRecord
} from "../../../common/testimony/types"

export const {
  syncToSearchIndex: syncTestimonyToSearchIndex,
  upgradeSearchIndex: upgradeTestimonySearchIndex
} = createSearchIndexer<TestimonySearchRecord>({
  sourceCollection: db.collectionGroup("publishedTestimony"),
  documentTrigger: "users/{uid}/publishedTestimony/{id}",
  alias: "publishedTestimony",
  idField: "id",
  schema: {
    fields: [
      { name: "billId", type: "string", facet: true },
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
