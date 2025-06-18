import * as functions from "firebase-functions"
import { db } from "../firebase"
import { z } from "zod"
import { fail, checkRequestZod, checkAuth, checkAdmin } from "../common"
// import { performDeleteTestimony } from "./deleteTestimony"
import { first } from "lodash"
import { Testimony } from "./types"
import { Profile } from "../../../common/profile/types"

export type Request = z.infer<typeof Request>
const Request = z.object({
  reportId: z.string(),
  resolution: z.enum(["allow-testimony", "remove-testimony"]),
  reason: z.string().min(1).optional()
})

export type Response = {
  status: "success" | "report-already-resolved" | "testimony-already-removed"
}

export const resolveReport = functions.https.onCall(
  async (data, context): Promise<Response> => {
    checkAuth(context, false)
    checkAdmin(context)

    const { reportId, resolution, reason } = checkRequestZod(Request, data)

    // 1. Get the report document
    const reportRef = db.collection("reports").doc(reportId)
    const report = await reportRef.get()
    if (!report.exists) throw fail("not-found", "Report not found")
    if (report.data()?.resolution) return { status: "report-already-resolved" }

    // 2. Get the testimony document
    const { testimonyId } = report.data() ?? {}
    const res = await db
      .collectionGroup("publishedTestimony")
      .where("id", "==", testimonyId)
      .get()

    const rawTestimony = first(res.docs)?.data()
    console.log("res", testimonyId, rawTestimony, res.docs.length)
    if (!rawTestimony) return { status: "testimony-already-removed" }
    const testimony = Testimony.check(rawTestimony)

    // 3. Get the moderator's profile document
    const moderatorUid = context.auth!.uid
    const moderator = Profile.check(
      await db
        .doc(`profiles/${moderatorUid}`)
        .get()
        .then(d => d.data())
    )

    // ***archived testiomny Id === published testimony Id***

    // 4 Get the archived testimony document
    // const archivedTestimonyId = await db
    //   .collection(`/users/${testimony.authorUid}/archivedTestimony`)
    //   .where("billId", "==", testimony.billId)
    //   .where("court", "==", testimony.court)
    //   .where("version", "==", testimony.version)
    //   .limit(1)
    //   .get()
    //   .then(snap => {
    //     if (snap.empty) return testimony.id // throw fail("not-found", "Archived testimony not found")
    //     return snap.docs[0].id
    //   })

    // 5. Update the report
    const resolutionObj: any = {
      resolution,
      moderatorUid,
      resolvedAt: new Date(),
      authorUid: testimony.authorUid,
      archivedTestimonyId: testimonyId
    }
    if (reason) resolutionObj.reason = reason
    if (moderator.fullName) resolutionObj.moderatorName = moderator.fullName

    await reportRef.update({
      resolution: resolutionObj
    })
    return { status: "success" }
  }
)
