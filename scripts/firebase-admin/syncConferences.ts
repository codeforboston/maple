import * as fs from "fs"
import * as yaml from "js-yaml"
import * as path from "path"
import { Boolean, Optional, Record, String } from "runtypes"
import {
  Conference,
  conferenceCountFields
} from "../../functions/src/conferences/types"
import { Script } from "./types"

/**
 * Writes a conference document per YAML file under `conferences/{court}` and
 * deletes documents whose file is gone. See docs/updating-conferences.md.
 *
 *   yarn firebase-admin run-script syncConferences --env local --dry-run
 *   yarn firebase-admin run-script syncConferences --env local --dir path/
 */
const Args = Record({ dir: Optional(String), dryRun: Optional(Boolean) })

export const script: Script = async ({ db, args }) => {
  const { dir = path.resolve(process.cwd(), "conferences"), dryRun = false } =
    Args.check(args)

  const files = (fs.readdirSync(dir, { recursive: true }) as string[]).filter(
    f => f.endsWith(".yaml")
  )

  const errors: string[] = []
  const warnings: string[] = []
  const desired = new Map<string, { file: string; conf: Conference }>()
  const billOf = new Map<string, string>()
  for (const file of files) {
    const raw: any = yaml.load(fs.readFileSync(path.join(dir, file), "utf8"))
    const checked = Conference.validateWithDefaults(raw)
    if (!checked.success) {
      errors.push(
        `${file}: ${checked.message} ${JSON.stringify(checked.details ?? {})}`
      )
      continue
    }
    const conf = checked.value
    // The document is the YAML as written, so a misspelt key would land in
    // Firestore beside the field it meant to set.
    const unknown = Object.keys(raw).filter(k => !(k in Conference.fields))
    if (unknown.length)
      errors.push(`${file}: unknown field(s) ${unknown.join(", ")}`)
    // getConferenceForBill picks the field to query from the bill's prefix.
    if (!conf.senateBillId.startsWith("S") || !conf.houseBillId.startsWith("H"))
      errors.push(
        `${file}: senateBillId must be an S bill and houseBillId an H bill`
      )
    const expected = path.join(`${conf.court}`, `${conf.id}.yaml`)
    if (file !== expected && !file.endsWith(path.sep + expected)) {
      errors.push(`${file}: court and id say it belongs at ${expected}`)
      continue
    }
    if (![conf.senateBillId, conf.houseBillId].includes(conf.canonicalBillId))
      errors.push(`${file}: canonicalBillId must be the Senate or House bill`)
    const docPath = `generalCourts/${conf.court}/conferences/${conf.id}`
    if (desired.has(docPath)) {
      errors.push(`${file}: duplicate conference ${docPath}`)
      continue
    }
    desired.set(docPath, { file, conf })
    for (const billId of [conf.senateBillId, conf.houseBillId]) {
      const billPath = `generalCourts/${conf.court}/bills/${billId}`
      const other = billOf.get(billPath)
      if (other) errors.push(`${file}: ${billId} is also in ${other}`)
      billOf.set(billPath, file)
    }
    for (const branch of ["House", "Senate"] as const) {
      const n = conf.conferees.filter(c => c.branch === branch).length
      if (n !== 3)
        warnings.push(`${file}: ${n} ${branch} conferees, expected 3`)
    }
  }

  // Referenced bills should exist; conferees should exist and sit in the
  // chamber the YAML says. One batched read each.
  const exists = async (paths: string[], fieldMask: string[]) => {
    const refs = [...new Set(paths)].map(p => db.doc(p))
    const snaps = refs.length ? await db.getAll(...refs, { fieldMask }) : []
    return new Map(snaps.map(s => [s.ref.path, s.exists ? s.data() : null]))
  }
  const bills = await exists([...billOf.keys()], [])
  for (const [billPath, file] of billOf) {
    if (!bills.get(billPath)) warnings.push(`${file}: ${billPath} not found`)
  }
  const memberPath = (court: number, code: string) =>
    `generalCourts/${court}/members/${code}`
  const members = await exists(
    [...desired.values()].flatMap(({ conf }) =>
      conf.conferees.map(c => memberPath(conf.court, c.memberCode))
    ),
    ["content.Branch"]
  )
  for (const { file, conf } of desired.values()) {
    for (const { memberCode, branch } of conf.conferees) {
      const member = members.get(memberPath(conf.court, memberCode))
      const actual = member?.content?.Branch
      if (!member) warnings.push(`${file}: member ${memberCode} not found`)
      else if (actual && actual !== branch) {
        errors.push(`${file}: ${memberCode} is in the ${actual}, not ${branch}`)
      }
    }
  }

  const current = new Map(
    (
      await db
        .collectionGroup("conferences")
        .select(...conferenceCountFields)
        .get()
    ).docs.map(d => [d.ref.path, d.data()])
  )
  const toSet = [...desired.keys()]
  const toDelete = [...current.keys()].filter(p => !desired.has(p))

  for (const w of warnings) console.warn(`warning: ${w}`)
  if (errors.length) {
    for (const e of errors) console.error(`error: ${e}`)
    throw Error(`${errors.length} error(s); nothing written`)
  }
  const would = dryRun ? "would " : ""
  toSet.forEach(p => console.log(`${would}set ${p}`))
  toDelete.forEach(p => console.log(`${would}delete ${p}`))

  if (!dryRun) {
    const writer = db.bulkWriter()
    for (const docPath of toSet) {
      const { conf } = desired.get(docPath)!
      const counts = Object.fromEntries(
        conferenceCountFields.map(f => [
          f,
          current.get(docPath)?.[f] ?? conf[f]
        ])
      )
      writer.set(db.doc(docPath), { ...conf, ...counts })
    }
    for (const docPath of toDelete) writer.delete(db.doc(docPath))
    await writer.close()
    console.log(`${toSet.length + toDelete.length} write(s) committed`)
  }
  return { set: toSet, delete: toDelete, warnings }
}
