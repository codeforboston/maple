import * as fs from "fs"
import * as path from "path"
import * as yaml from "js-yaml"
import { deburr } from "lodash"
import { Number, Optional, Record, String } from "runtypes"
import { BillHistoryAction } from "../../functions/src/bills/types"
import { ConferenceStatus } from "../../functions/src/conferences/types"
import {
  currentGeneralCourt,
  splitMemberName
} from "../../functions/src/shared"
import { Script } from "./types"

/**
 * Lists every committee of conference a court's bill histories mention, and
 * drafts a YAML file per conference for `conferences/{court}/`. Read-only.
 *
 * The appointment action names the conferees. The pairing is the other
 * chamber's last reprint before the appointment: "Reprinted, as amended, see
 * S3166" on a House bill, "Text of H5618, published as H5630" on a Senate
 * bill. Status is guessed from what follows the appointment. Members are
 * matched by surname within their branch, with a leading initial used to
 * break ties; anything unmatched is left as a TODO for a person to finish.
 *
 *   yarn firebase-admin run-script findConferences --env dev
 *   yarn firebase-admin run-script findConferences --env dev --court 194 --out conferences
 */
const Args = Record({
  court: Optional(Number),
  out: Optional(String)
})

const APPOINTED = /committee of conference appointed/i
const NAMES = /\(([^)]+)\)/
const REPRINT = /(?:\bsee|published as) ([HS]\d+)\b/i
const TEXT_OF = /text of ([HS]\d+)\b/i
const REPORT = /reported(?:, in part,)? by ([HS]\d+)/i
const ENACTED = /\b(enacted|signed by the governor|chapter \d+ of the acts)\b/i
const DISSOLVED = /conference committee (discharged|dissolved)/i

type Member = { code: string; branch: string; first: string }

/** History spells "Gómez" and "González" without accents. */
const fold = (s: string) => deburr(s).toLowerCase()

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/^an act (to |relative to |providing for |establishing )?/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .split("-")
    .slice(0, 5)
    .join("-")

const chamber = (billId: string) =>
  billId.startsWith("S") ? "Senate" : "House"

export const script: Script = async ({ db, args }) => {
  const { court = currentGeneralCourt, out } = Args.check(args)

  const [members, bills, hearings] = await Promise.all([
    db
      .collection(`/generalCourts/${court}/members`)
      .select("content.Name", "content.Branch", "content.MemberCode")
      .get(),
    db
      .collection(`/generalCourts/${court}/bills`)
      .select("id", "history", "content.Title")
      .get(),
    db
      .collection("events")
      .where("type", "==", "hearing")
      .select("content.EventId", "content.Description", "content.EventDate")
      .get()
  ])
  const bySurname = new Map<string, Member[]>()
  for (const d of members.docs) {
    const { Name, Branch, MemberCode } = d.data().content ?? {}
    if (!Name || !MemberCode) continue
    const { first, surname } = splitMemberName(Name)
    bySurname.set(fold(surname), [
      ...(bySurname.get(fold(surname)) ?? []),
      { code: MemberCode, branch: Branch, first }
    ])
  }
  const known = (surname: string, branch: string) =>
    (bySurname.get(fold(surname)) ?? []).filter(m => m.branch === branch)

  /** "Livingstone-Garcia-Sullivan-Almeida" is three people; "F. Moran" is one
   * with an initial. Walk the hyphen-separated tokens, joining a pair when the
   * joined form is a member's surname. */
  const parseConferees = (names: string, branch: string) => {
    const tokens = names
      .split("-")
      .map(t => t.trim())
      .filter(Boolean)
    const out: { memberCode: string; branch: string }[] = []
    for (let i = 0; i < tokens.length; i++) {
      const joined = tokens[i + 1] && `${tokens[i]}-${tokens[i + 1]}`
      const token = joined && known(joined, branch).length ? joined : tokens[i]
      if (token === joined) i++
      const [, initial, surname] = token.match(/^(?:([A-Z])\.\s*)?(.+)$/) ?? []
      let hits = known(surname, branch)
      if (hits.length > 1 && initial) {
        hits = hits.filter(m => m.first.startsWith(initial))
      }
      out.push({
        memberCode: hits.length === 1 ? hits[0].code : `TODO ${token}`,
        branch
      })
    }
    return out
  }

  // Authored files are often renamed from the generated slug, so an existing
  // conference is recognised by its bills, not its file name.
  const outDir = out && path.join(out, `${court}`)
  const authored = new Map<string, string>()
  if (outDir && fs.existsSync(outDir))
    for (const f of fs.readdirSync(outDir).filter(f => f.endsWith(".yaml"))) {
      const conf: any = yaml.load(fs.readFileSync(path.join(outDir, f), "utf8"))
      for (const billId of [conf?.senateBillId, conf?.houseBillId])
        if (billId) authored.set(billId, f)
    }

  const slugs = new Set<string>()
  for (const d of bills.docs) {
    const { id, content } = d.data()
    const history: BillHistoryAction[] = d.data().history ?? []
    const appointments = history.filter(a => APPOINTED.test(a.Action))
    if (!appointments.length) continue
    const first = history.indexOf(appointments[0])

    const title: string = (content?.Title ?? "").trim()
    const own = chamber(id)
    const after = history.slice(first)

    const otherChamber = history.slice(0, first).filter(a => a.Branch !== own)
    const lastMatch = (re: RegExp) =>
      otherChamber
        .map(a => a.Action.match(re)?.[1])
        .filter(Boolean)
        .pop()
    const partner = lastMatch(REPRINT) ?? lastMatch(TEXT_OF)

    let status: ConferenceStatus = "appointed"
    const report = after.map(a => a.Action.match(REPORT)?.[1]).find(Boolean)
    if (after.some(a => DISSOLVED.test(a.Action))) status = "dissolved"
    else if (after.some(a => ENACTED.test(a.Action))) status = "enacted"
    else if (report) status = "reportFiled"

    const conferees = appointments.flatMap(a =>
      parseConferees(a.Action.match(NAMES)?.[1] ?? "", a.Branch)
    )

    let slug = slugify(title) || id.toLowerCase()
    if (slugs.has(slug)) slug = `${slug}-${id.toLowerCase()}`
    slugs.add(slug)

    const draft = {
      id: slug,
      court,
      title,
      senateBillId: own === "Senate" ? id : partner ?? "TODO",
      houseBillId: own === "House" ? id : partner ?? "TODO",
      canonicalBillId: id,
      status,
      conferees,
      hearingIds: [],
      differences: [],
      similarities: []
    }

    console.log(`\n# ${id}: ${title}`)
    console.log(`#   status ${status}${report ? `, report ${report}` : ""}`)
    for (const a of appointments) console.log(`#   ${a.Date}  ${a.Action}`)
    if (!partner)
      console.log(`#   no partner reprint found before the appointment`)
    const last = history[history.length - 1]
    if (last) console.log(`#   last action ${last.Date}  ${last.Action}`)

    const text = yaml.dump(draft, { lineWidth: 100 })
    if (outDir) {
      const file = path.join(outDir, `${draft.id}.yaml`)
      fs.mkdirSync(outDir, { recursive: true })
      const existing = authored.get(id)
      if (existing) {
        console.log(`#   already in ${existing}, not drafting`)
      } else if (fs.existsSync(file)) {
        console.log(`#   ${file} exists, not overwriting`)
      } else {
        fs.writeFileSync(file, text)
        console.log(`#   wrote ${file}`)
      }
    } else {
      console.log(text)
    }
  }
  console.log(
    `\n${bills.size} bills in court ${court}; ${slugs.size} carry an appointment action`
  )

  // Conference hearings arrive with an empty agenda, so they are linked by
  // hand. List the candidates: the id goes in `hearingIds`.
  console.log(`\n# hearings mentioning a conference, for hearingIds:`)
  hearings.docs
    .map(d => d.data().content ?? {})
    .filter(c => /conference/i.test(c.Description ?? ""))
    .sort((a, b) => (a.EventDate < b.EventDate ? -1 : 1))
    .forEach(c =>
      console.log(
        `#   hearing-${c.EventId}  ${c.EventDate?.slice(0, 10)}  ${
          c.Description
        }`
      )
    )
}
