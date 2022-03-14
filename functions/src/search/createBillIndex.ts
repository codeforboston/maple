import { pubsub } from "firebase-functions"
import { db, storage } from "../firebase"
import * as api from "../malegislature"
import Fuse from "fuse.js"

const fuseIndexFilename = "billFuseIndex.json"

export const createBillIndex = pubsub
  .schedule("every 7 days")
  .onRun(async () => {
    const indexedKeys = [
      "content.PrimarySponsor.Name",
      "content.Pinslip",
      "content.Title"
    ]

    const bills = await db
      .collection(`generalCourts/${api.currentGeneralCourt}/bills`)
      .select("id", ...indexedKeys)
      // .limit(10)
      .get()
      .then(r => r.docs.map(d => d.data()))

    const index = Fuse.createIndex(indexedKeys, bills)
    const serializedIndex = JSON.stringify(index.toJSON())

    await storage.bucket().file(fuseIndexFilename).save(serializedIndex, {
      contentType: "application/json",
      gzip: true,
      resumable: false
    })
  })
