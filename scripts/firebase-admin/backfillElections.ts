import { Record, Number } from "runtypes"
import { Script } from "./types"
import { fetchElectionsData } from "functions/src/legislators/scrapeElections"

const Args = Record({
  startYear: Number
})

export const script: Script = async ({ db, args }) => {
  const { startYear } = Args.check(args)
  const currentYear = new Date().getFullYear()
  const writer = db.bulkWriter()
  for (let year = startYear; year <= currentYear; year++) {
    const data = await fetchElectionsData(year, year)
    for (const item of data) {
      ;(await db.doc(`/electionResults/${item.id}`).get()).ref.set(item, {
        merge: true
      })
    }
  }
  await writer.close()
}
