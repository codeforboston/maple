import { readFileSync } from "fs"
import papa from "papaparse"
import {
  Array,
  Literal,
  Optional,
  Record,
  String,
  Tuple,
  Union
} from "runtypes"
import { performDeleteTestimony } from "../../functions/src/testimony"
import { Script } from "./types"

const Csv = Record({
  data: Array(Record({ id: String, authorUid: String })),
  // No Parse errors
  errors: Tuple()
})
const Args = Record({
  publicationsCsvPath: String,
  force: Optional(Union(Literal("true"), Literal(true)))
})

/**
 * yarn firebase-admin -e prod run-script batchDeleteTestimony --publicationsCsvPath=./prod-testimony.csv  --force true
 */
export const script: Script = async ({ args }) => {
  const { publicationsCsvPath, force } = Args.check(args)
  const csv = readFileSync(publicationsCsvPath, { encoding: "utf8" })
  const publications = Csv.check(papa.parse(csv, { header: true })).data

  if (!force) console.log("Dry run, specify --force true to delete")
  for (const { authorUid, id } of publications) {
    console.log(`Processing id ${id} author ${authorUid}`)
    if (force) console.log(await performDeleteTestimony(authorUid, id))
  }
}
