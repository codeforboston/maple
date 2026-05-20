import axios from "axios"
import { promises as fs } from "fs"
import path from "path"
import { Timestamp } from "../../functions/src/firebase"
import { parseSecDistricts } from "../../functions/src/districts"
import type { ParsedDistrict } from "../../functions/src/districts"
import { currentGeneralCourt } from "../../functions/src/shared"
import type { Script, ScriptContext } from "./types"

const sources = [
  {
    branch: "Senate" as const,
    expectedCount: 40,
    fileName: "senatorial.html",
    url: "https://www.sec.state.ma.us/divisions/elections/voting-information/district/2022-senatorial.htm"
  },
  {
    branch: "House" as const,
    expectedCount: 160,
    fileName: "representative.html",
    url: "https://www.sec.state.ma.us/divisions/elections/voting-information/district/2022-representative.htm"
  }
]

type Source = (typeof sources)[number]

function shouldFetch(args: ScriptContext["args"]) {
  return args.fetch === true || args.argv.includes("--fetch")
}

async function fetchHtml(url: string) {
  const response = await axios.get<string>(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; MAPLE district backfill; +https://mapletestimony.org)"
    },
    responseType: "text",
    timeout: 60_000
  })
  return response.data
}

async function readHtml(source: Source, args: ScriptContext["args"]) {
  if (shouldFetch(args)) return fetchHtml(source.url)

  const dir =
    typeof args["district-dir"] === "string"
      ? args["district-dir"]
      : path.resolve(process.cwd(), "districts")

  return fs.readFile(path.join(dir, source.fileName), "utf8")
}

function logCollisions(districts: ParsedDistrict[]) {
  const byId = new Map<string, ParsedDistrict[]>()
  districts.forEach(district => {
    byId.set(district.id, [...(byId.get(district.id) ?? []), district])
  })

  Array.from(byId.entries())
    .filter(([, matchingDistricts]) => matchingDistricts.length > 1)
    .forEach(([id, matchingDistricts]) => {
      console.warn(
        `District normalization collision for ${id}: ${matchingDistricts
          .map(district => district.sourceDistrict)
          .join(", ")}`
      )
    })
}

export const script: Script = async ({ db, args }) => {
  const districts = (
    await Promise.all(
      sources.map(async source => {
        const html = await readHtml(source, args)
        const parsed = parseSecDistricts(html, {
          branch: source.branch,
          sourceUrl: source.url
        })

        if (parsed.length !== source.expectedCount) {
          throw Error(
            `Expected ${source.expectedCount} ${source.branch} districts, parsed ${parsed.length}`
          )
        }

        console.log(`Parsed ${parsed.length} ${source.branch} districts`)
        return parsed
      })
    )
  ).flat()

  logCollisions(districts)

  const writer = db.bulkWriter()
  const fetchedAt = Timestamp.now()

  districts.forEach(district => {
    writer.set(
      db.doc(`/generalCourts/${currentGeneralCourt}/districts/${district.id}`),
      { ...district, fetchedAt },
      { merge: true }
    )
  })

  await writer.close()
  console.log(
    `Upserted ${districts.length} districts for general court ${currentGeneralCourt}`
  )
}
