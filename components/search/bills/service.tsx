import { getBytes, ref } from "firebase/storage"
import Fuse from "fuse.js"
import { useMemo } from "react"
import type { BillSearchIndex } from "../../../functions/src/bills/updateBillSearchIndex"
import { storage } from "../../firebase"
import { createService } from "../../service"

export type SearchService = ReturnType<typeof useServiceChecked>
export const { Provider, useServiceChecked } = createService(() => {
  return useMemo(() => new BillSearch().service, [])
})

class BillSearch {
  service = {
    initialize: () => this.getIndex().then(() => {}),
    billContents: this.createSearch(
      i => i.bills,
      {
        // Weigh terms that appear at the end of a field the same as those that
        // appear at the start.
        ignoreLocation: true,
        // Weigh long fields the same as short ones
        // https://github.com/krisk/Fuse/blob/master/test/scoring.test.js#L32
        ignoreFieldNorm: true,
        keys: [
          { name: "title", weight: 3 },
          { name: "primarySponsorName", weight: 2 }
        ]
      },
      100
    ),
    billIds: this.createSearch(
      i => i.bills,
      {},
      100,
      index => {
        index.setKeys(["id"])
        return index
      }
    ),
    cities: this.createSearch(i => i.cities, {}, 300),
    committees: this.createSearch(
      i => i.committees,
      {
        keys: [{ name: "name", weight: 3 }]
      },
      100
    ),
    members: this.createSearch(
      i => i.members,
      {
        keys: [
          { name: "name", weight: 3 },
          { name: "district", weight: 2 }
        ]
      },
      300
    )
  }

  private billSearchFilename = "search/billSearchIndex.json"

  /** Lazy-loaded index */
  private getIndex = (() => {
    let index: Promise<BillSearchIndex> | undefined
    return async () => {
      if (!index) {
        index = getBytes(ref(storage, this.billSearchFilename))
          .then(data => {
            const parsed: BillSearchIndex = JSON.parse(
              new TextDecoder("utf8").decode(data)
            )
            return parsed
          })
          .catch(e => {
            index = undefined
            throw e
          })
      }
      return index!
    }
  })()

  /** Closure to lazy-initialize the fuse search for a particular item type. */
  private createSearch<T>(
    extract: (i: BillSearchIndex) => { items: T[]; index: any },
    indexOptions: Fuse.IFuseOptions<T> = {},
    limit = 50,
    prepareIndex: (i: Fuse.FuseIndex<T>) => Fuse.FuseIndex<T> = i => i
  ) {
    let fuse: Fuse<T>
    let items: T[]
    const load = async () => {
      if (!fuse || !items) {
        const fullIndex = await this.getIndex()
        const ext = extract(fullIndex)
        items = ext.items
        const index = prepareIndex(Fuse.parseIndex(ext.index))
        fuse = new Fuse(items, indexOptions, index)
      }
    }

    return async (pattern: string) => {
      await load()

      if (pattern === "") {
        return items.slice(0, limit)
      } else {
        return fuse.search(pattern, { limit }).map(i => i.item)
      }
    }
  }
}
