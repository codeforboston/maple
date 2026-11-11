import * as fs from "fs"
import * as yaml from "js-yaml"
import * as path from "path"
import { Boolean, Optional, Record, Runtype, String } from "runtypes"
import {
  Conference,
  conferenceCountFields,
  conferenceResolutionFields
} from "../../functions/src/conferences/types"
import { hasReport } from "../../functions/src/shared/conferences"
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
  const reports = new Map<string, string>()
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
    const unknown = unknownKeys(Conference, raw)
    if (unknown.length)
      errors.push(`${file}: unknown field(s) ${unknown.join(", ")}`)
    errors.push(...resolutionErrors(conf).map(e => `${file}: ${e}`))
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
    // The report is filed once the committee agrees, so an appointed
    // conference can't have one, and it's never one of the pair.
    if (conf.reportBillId) {
      if (conf.status === "appointed")
        errors.push(`${file}: reportBillId on an appointed conference`)
      if ([conf.senateBillId, conf.houseBillId].includes(conf.reportBillId))
        errors.push(`${file}: reportBillId must be the report, not the pair`)
      reports.set(
        `generalCourts/${conf.court}/bills/${conf.reportBillId}`,
        file
      )
    }
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
  const bills = await exists([...billOf.keys(), ...reports.keys()], [])
  for (const [billPath, file] of [...billOf, ...reports]) {
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

/** Keys the runtype has no field for, at any depth, by path. runtypes
 * records let extra keys through. */
function unknownKeys(type: Runtype, value: unknown, at = ""): string[] {
  const r = type.reflect
  const under = (k: string | number) =>
    typeof k === "number" ? `${at}[${k}]` : at ? `${at}.${k}` : k
  if (r.tag === "optional") return unknownKeys(r.underlying, value, at)
  if (r.tag === "array" && Array.isArray(value))
    return value.flatMap((v, i) => unknownKeys(r.element, v, under(i)))
  if (r.tag === "record" && value && typeof value === "object")
    return Object.entries(value).flatMap(([k, v]) =>
      k in r.fields ? unknownKeys(r.fields[k], v, under(k)) : [under(k)]
    )
  return []
}

/** Once the report is filed, every question says how the law resolved it;
 * before, none can. */
function resolutionErrors(conf: Conference) {
  const errors: string[] = []
  conf.differences.forEach((d, i) => {
    const at = `differences[${i}]`
    if (!hasReport(conf)) {
      const set = conferenceResolutionFields.filter(k => d[k] !== undefined)
      if (set.length)
        errors.push(`${at}: ${set.join(", ")} before a report is filed`)
      return
    }
    if (!d.outcome || !d.addressedBy) {
      errors.push(`${at}: outcome and addressedBy once a report is filed`)
      return
    }
    if (d.edited && !["senate", "house", "combined"].includes(d.outcome))
      errors.push(`${at}: edited goes only with senate, house or combined`)
    if ((d.outcome === "new") !== (d.addressedBy === "neither"))
      errors.push(
        `${at}: outcome new goes with addressedBy neither, and only it`
      )
    // A question one bill alone took up can't end in the other's text.
    if (
      (d.addressedBy === "senate" || d.addressedBy === "house") &&
      (d.outcome === "senate" || d.outcome === "house") &&
      d.outcome !== d.addressedBy
    )
      errors.push(
        `${at}: outcome ${d.outcome} on a question only the ${d.addressedBy} took up`
      )
  })
  return errors
}
