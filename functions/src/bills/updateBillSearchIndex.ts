import Fuse from "fuse.js"
import { storage } from "../firebase"
import BillProcessor from "./BillProcessor"

export type BillSearchIndex = {
  bills: {
    items: {
      id: string
      title: string
      pinslip?: string
      primarySponsorName?: string
    }[]
    index: any
  }
  cities: {
    items: { name: string }[]
    index: any
  }
  committees: {
    items: { id: string; name: string }[]
    index: any
  }
  members: {
    items: { id: string; name: string; district?: string; branch?: string }[]
    index: any
  }
}

class UpdateBillSearchIndex extends BillProcessor {
  async process() {
    const index: BillSearchIndex = {
      bills: this.indexItems(
        this.bills.map(b => ({
          id: b.id,
          pinslip: b.content.Pinslip ?? undefined,
          title: b.content.Title,
          primarySponsorName: b.content.PrimarySponsor?.Name
        }))
      ),
      cities: this.indexItems(this.cities.map(c => ({ name: c.id }))),
      committees: this.indexItems(
        this.committees.map(c => ({ id: c.id, name: c.content.FullName }))
      ),
      members: this.indexItems(
        this.members.map(m => ({
          id: m.id,
          name: m.content.Name,
          district: m.content.District ?? undefined,
          branch: m.content.Branch ?? undefined
        }))
      )
    }

    await this.saveIndex(index)
  }

  override get billFields() {
    return ["id", "content.Pinslip", "content.Title", "content.PrimarySponsor"]
  }

  private indexItems<T extends {}>(items: T[]) {
    const keys = Object.keys(items[0])
    return { items, index: Fuse.createIndex(keys, items).toJSON() }
  }

  private async saveIndex(index: BillSearchIndex) {
    const file = storage.bucket().file("search/billSearchIndex.json")

    await file.save(Buffer.from(JSON.stringify(index), "utf8"), {
      contentType: "application/json",
      gzip: true,
      resumable: false
    })

    // Set the max-age to half the time between jobs
    await file.setMetadata({ cacheControl: "public, max-age=43200" })
  }
}

export const updateBillSearchIndex = BillProcessor.scheduled(
  UpdateBillSearchIndex
)
