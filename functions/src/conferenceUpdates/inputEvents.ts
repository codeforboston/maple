import { onDocumentWritten } from "firebase-functions/v2/firestore"
import { db, Timestamp } from "../firebase"
import { ConferencePosition, Testimony } from "../testimony/types"
import { authorGroupOf, ConferenceInputEvent, InputState } from "./types"

type Publication = Pick<
  Testimony,
  "conferenceId" | "court" | "authorUid" | "authorRole" | "position" | "version"
>

export const stateOf = (t: Publication): InputState | undefined =>
  ConferencePosition.guard(t.position)
    ? {
        position: t.position,
        group: authorGroupOf(t.authorRole),
        version: t.version
      }
    : undefined

/** What a write to a publication means for the weekly update, or nothing.
 * Only conference input counts, so a write to anything else has no event. A write
 * that keeps the version, such as the cosign tally's, is not an edit. */
export function conferenceInputEvent(
  before: Publication | undefined,
  after: Publication | undefined,
  testimonyId: string
): Omit<ConferenceInputEvent, "at"> | undefined {
  const current = after ?? before
  if (!current?.conferenceId) return undefined
  const b = before && stateOf(before)
  const a = after && stateOf(after)
  if (!b && !a) return undefined
  if (b && a && b.version === a.version) return undefined
  return {
    court: current.court,
    conferenceId: current.conferenceId,
    testimonyId,
    authorUid: current.authorUid,
    change: !b ? "added" : !a ? "withdrawn" : "edited",
    ...(b && { before: b }),
    ...(a && { after: a })
  }
}

/** Records each change to conference input, for the weekly update to
 * read. The event's id is the trigger event's, so a retry writes the same
 * document. */
export const recordConferenceInput = onDocumentWritten(
  {
    document: "/users/{userId}/publishedTestimony/{testimonyId}",
    timeoutSeconds: 30,
    retry: true
  },
  async event => {
    const change = event.data
    if (!change) return
    const body = conferenceInputEvent(
      change.before.data() as Publication | undefined,
      change.after.data() as Publication | undefined,
      event.params.testimonyId
    )
    if (!body) return
    await db
      .collection("/conferenceInputEvents")
      .doc(event.id)
      .set({ ...body, at: Timestamp.fromDate(new Date(event.time)) })
  }
)
