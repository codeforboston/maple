import { DocumentSnapshot } from "@google-cloud/firestore"
import { waitFor } from "@testing-library/react"
import axios from "axios"
import { currentGeneralCourt } from "functions/src/shared"
import { first } from "lodash"
import { nanoid } from "nanoid"
import { CollectionAliasSchema } from "typesense/lib/Typesense/Aliases"
import { Timestamp } from "../../functions/src/firebase"
import { createClient } from "../../functions/src/search/client"
import { SearchIndexer } from "../../functions/src/search/SearchIndexer"
import { testDb } from "../testUtils"
import { createFakeBill } from "./common"

// Backfill operation can take some time. Consider doing a partial backfil in
// test.
const timeoutMs = 10000
jest.setTimeout(timeoutMs)

const client = createClient()
const testAlias = "bills"
const mediumTimeout = { timeout: 5000, interval: 1000 }

// passing in local tests but failing with "network error" in ci
describe.skip("Upgrades", () => {
  it("upgrades collections when schemas are missing", async () => {
    await clearAliases()
    await clearCollections()
    await triggerUpgradeCheck()

    await assertBackfill()

    // it("Does nothing for subsequent upgrade checks")

    const existingUpgrade = await lastUpgradeTime()

    await triggerUpgradeCheck()

    // Assert that no upgrade was scheduled within X seconds of triggering the check
    // TODO: Wait for a signal rather than a fixed period of time
    const newUpgradeScheduled = waitFor(() =>
      expect(lastUpgradeTime()).resolves.not.toEqual(existingUpgrade)
    )

    await expect(newUpgradeScheduled).rejects.toThrow()
  })

  it("upgrades collections when schemas are outdated", async () => {
    await clearAliases()
    await clearCollections()

    const outdatedCollectionName = `${testAlias}_outdated`
    await client.collections().create({
      name: outdatedCollectionName,
      fields: [{ name: "test", type: "string" }]
    })
    await client
      .aliases()
      .upsert(testAlias, { collection_name: outdatedCollectionName })

    await triggerUpgradeCheck()
    const alias = await assertBackfill()

    expect(alias.collection_name).not.toEqual(outdatedCollectionName)
  })

  async function triggerUpgradeCheck() {
    await axios({
      method: "GET",
      url: "http://localhost:5001/demo-dtp/us-central1/triggerPubsubFunction",
      params: {
        pubsub: "checkSearchIndexVersion",
        data: JSON.stringify({ check: true, numBatches: 1 })
      }
    })
  }

  async function lastUpgradeTime(): Promise<Timestamp> {
    const existingUpgrade = await testDb
      .doc(SearchIndexer.upgradePath(testAlias))
      .get()
    expect(existingUpgrade.exists).toBeTruthy()
    return existingUpgrade.data()!.createdAt
  }

  async function assertBackfill() {
    let alias: CollectionAliasSchema
    await waitFor(async () => {
      alias = await client.aliases(testAlias).retrieve()
      const collection = await client
        .collections(alias.collection_name)
        .retrieve()
      expect(alias.name).toBe(testAlias)
      expect(collection.num_documents).toBeGreaterThan(0)
    }, mediumTimeout)
    return alias!
  }
})
// passing in local tests but failing with "network error" in ci
describe.skip("Sync", () => {
  let existing: DocumentSnapshot
  let existingId: string
  let billId: string
  let searchId: string
  let newBill: any
  let newBillPath: string
  const court = currentGeneralCourt

  beforeEach(async () => {
    await clearCollections()
    await clearAliases()

    billId = `test-bill-${nanoid()}`
    searchId = `${court}-${billId}`
    newBillPath = `/generalCourts/${court}/bills/${billId}`
    existingId = await createFakeBill()
    existing = await testDb
      .doc(`/generalCourts/${court}/bills/${existingId}`)
      .get()
    newBill = { ...existing.data()!, id: billId }
  })

  it("Creates documents on create", async () => {
    await testDb.doc(newBillPath).create(newBill)
    await assertDocumentExists()
  })

  it("Updates documents on update", async () => {
    await testDb.doc(newBillPath).create(newBill)
    await assertDocumentExists()

    const updatedTitle = "updated title"
    await testDb.doc(newBillPath).update({ "content.Title": updatedTitle })
    await assertDocumentTitle(updatedTitle)
  })

  it("Deletes documents on delete", async () => {
    await testDb.doc(newBillPath).create(newBill)
    await assertDocumentExists()

    await testDb.doc(newBillPath).delete({ exists: true })
    await assertDocumentDeleted()
  })

  async function assertDocumentDeleted() {
    await waitFor(() => expect(getDoc()).rejects.toThrow(), mediumTimeout)
  }

  async function assertDocumentExists() {
    await waitFor(async () => {
      const doc = await getDoc()
      expect(doc.id).toEqual(searchId)
    }, mediumTimeout)
  }

  async function assertDocumentTitle(title: string) {
    await waitFor(async () => {
      const doc = await getDoc()
      expect(doc.title).toEqual(title)
    }, mediumTimeout)
  }

  async function getDoc() {
    const collection = first(await client.collections().retrieve())
    expect(collection).toBeTruthy()
    return client
      .collections(collection!.name)
      .documents(searchId)
      .retrieve() as any
  }
})

async function clearCollections() {
  const collections = await client.collections().retrieve()
  for (const c of collections) {
    await client.collections(c.name).delete()
  }
}

async function clearAliases() {
  const { aliases } = await client.aliases().retrieve()
  for (const a of aliases) {
    await client.aliases(a.name).delete()
  }
}
