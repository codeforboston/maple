import axios from "axios"
import { FunctionName } from "functions/src"
import { uniq } from "lodash"
import { z } from "zod"
import { Script } from "./types"

/** All the scrapers that can be run */
const scrapers: {
  [K in FunctionName]?: K
} = {
  startBillBatches: "startBillBatches",
  startCityBatches: "startCityBatches",
  startCommitteeBatches: "startCommitteeBatches",
  startMemberBatches: "startMemberBatches",
  scrapeHearings: "scrapeHearings",
  scrapeSessions: "scrapeSessions",
  scrapeSpecialEvents: "scrapeSpecialEvents",
  updateCommitteeRosters: "updateCommitteeRosters",
  createMemberSearchIndex: "createMemberSearchIndex",
  updateBillReferences: "updateBillReferences"
}

const Args = z.object({
  targets: z
    .array(z.union(Object.values(scrapers).map(n => z.literal(n)) as any))
    .default(Object.values(scrapers))
    .transform(v => uniq(v)) as z.ZodType<Array<FunctionName>>
})

export const script: Script = async ({ env, args }) => {
  if (env !== "local") throw Error("only local supported")

  const targets = Args.parse(args).targets

  for (const target of targets) {
    await axios.get(
      `http://localhost:5001/demo-dtp/us-central1/triggerPubsubFunction?scheduled=${target}`
    )
  }
}
