import * as fs from "fs"
import * as yaml from "js-yaml"
import * as path from "path"
import { Timestamp } from "../../functions/src/firebase"
import { script as syncConferences } from "./syncConferences"
import { Script } from "./types"

/**
 * Brings a fresh local emulator up with the conference data: the real bills and
 * members every conference file names (fetched by the functions emulator's
 * scrapers, as a scrape would), the conferences themselves, a verified
 * test@example.com, and some sample testimony on one conference. Local only.
 *
 *   yarn emulators:start          # in another terminal, from a clean start
 *   yarn firebase-admin run-script seedLocal --env local
 */
const COURT = 194
const SAMPLE = "student-learning-and-mental-health"
const WAIT_MS = 180_000

const sample: [string, string, string, string][] = [
  [
    "Sam Okafor",
    "user",
    "passSenateVersion",
    "The Senate version gives districts a year longer. That matters for small districts like mine."
  ],
  [
    "Rep. Ellis Park",
    "legislator",
    "passHouseVersion",
    "As a member of the House I ask the committee to hold to the House text on enforcement dates."
  ],
  [
    "Dana Whitlock",
    "user",
    "passNothing",
    "Neither bill does what its sponsors say. I would rather the conference let both lapse."
  ],
  [
    "Example Statewide Coalition",
    "organization",
    "passSomething",
    "An organization account files under its own name. This one asks the conference to reach agreement without saying which chamber's text should win."
  ],
  [
    "Jordan Marsh",
    "user",
    "passHouseVersion",
    "An individual writes a few sentences about why the outcome matters to them, and it appears here with their name and the date."
  ],
  [
    "Fight for the Future",
    "organization",
    "passSenateVersion",
    "Our coalition continues to oppose any legislation that requires online age checks.\n\nHowever, the Senate bill, as amended, is the better of the two texts."
  ],
  [
    "Massachusetts Medical Society",
    "organization",
    "passSomething",
    "Dear Members of the Conference Committee:\n\nOn behalf of the over 22,000 members of the Massachusetts Medical Society, I write to convey our support of legislation to establish reasonable limits on student smartphone use during the school day. We urge you to report a bill that includes clear exceptions for medical need."
  ]
]

export const script: Script = async ctx => {
  const { env, db, auth } = ctx
  if (env !== "local") throw Error("only local supported")

  const dir = path.resolve(process.cwd(), "conferences", `${COURT}`)
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".yaml"))
  const bills = new Set<string>()
  const members = new Set<string>()
  for (const f of files) {
    const c: any = yaml.load(fs.readFileSync(path.join(dir, f), "utf8"))
    bills.add(c.senateBillId).add(c.houseBillId)
    c.conferees.forEach((m: any) => members.add(m.memberCode))
  }

  // The scrapers run in the functions emulator and write the real documents.
  for (const [name, ids] of [
    ["bills", [...bills]],
    ["members", [...members]]
  ] as const)
    await db.collection(`/scrapers/${name}/batches`).add({ court: COURT, ids })
  console.log(`queued ${bills.size} bills and ${members.size} members`)

  const want = [
    ...[...bills].map(id => `generalCourts/${COURT}/bills/${id}`),
    ...[...members].map(id => `generalCourts/${COURT}/members/${id}`)
  ]
  const started = Date.now()
  for (;;) {
    const snaps = await db.getAll(...want.map(p => db.doc(p)), {
      fieldMask: []
    })
    const missing = snaps.filter(s => !s.exists).length
    if (!missing) break
    if (Date.now() - started > WAIT_MS)
      throw Error(`${missing} bills or members still missing after waiting`)
    process.stdout.write(`\rwaiting on the scrapers: ${missing} left   `)
    await new Promise(r => setTimeout(r, 3000))
  }
  console.log("\nbills and members are in")

  await syncConferences(ctx)

  const user = await auth.getUserByEmail("test@example.com")
  await auth.updateUser(user.uid, { emailVerified: true })

  const conference = `generalCourts/${COURT}/conferences/${SAMPLE}`
  const { canonicalBillId, title } = (await db.doc(conference).get()).data()!
  const day = 86_400_000
  let at = Date.now() - sample.length * day
  for (const [i, [name, role, position, content]] of sample.entries()) {
    const uid = `seed-conference-${i}`
    const id = `seed-conference-testimony-${i}`
    at += day
    await db.doc(`users/${uid}/publishedTestimony/${id}`).set({
      id,
      authorUid: uid,
      authorDisplayName: name,
      fullName: name,
      authorRole: role,
      billId: canonicalBillId,
      court: COURT,
      billTitle: title,
      position,
      content,
      version: 1,
      public: true,
      conferenceId: SAMPLE,
      ballotQuestionId: null,
      publishedAt: Timestamp.fromMillis(at),
      updatedAt: Timestamp.fromMillis(at)
    })
  }
  console.log(`seeded ${sample.length} sample testimonies on ${SAMPLE}`)
}
