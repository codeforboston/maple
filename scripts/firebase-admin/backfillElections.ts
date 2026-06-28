import { Record, Number } from "runtypes"
import { Script } from "./types"
import { fetchElectionsData } from "functions/src/legislators/scrapeElections"
import { electionId } from "functions/src/legislators/electionTypes"

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
      const id = electionId(item)
      writer.set(db.doc(`/electionResults/${id}`), item, { merge: true })
    }
  }
  await writer.close()
}
