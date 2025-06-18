import { httpsCallable } from "firebase/functions"
import { functions } from "../../firebase"
import type * as report from "functions/src/testimony/resolveReport"
import { Testimony, WorkingDraft } from "common/testimony/types"

/** Returns true if both values are either falsy or strictly equal. */
const eqish = (a: any, b: any) => (a || undefined) === (b || undefined)

/** Returns true if the draft has user-visibly changed from the published
 * version./ */
export function hasDraftChanged(
  draft?: WorkingDraft,
  published?: Testimony
): boolean {
  if (!draft || !published) return false
  return (
    !eqish(published.position, draft.position) ||
    !eqish(published.content, draft.content) ||
    !eqish(published.draftAttachmentId, draft.attachmentId)
  )
}

export const deleteTestimony = httpsCallable<
  { publicationId: string },
  { deleted: boolean }
>(functions, "deleteTestimony")

export const publishTestimony = httpsCallable<
  { draftId: string },
  { publicationId: string }
>(functions, "publishTestimony")

export const resolveReport = httpsCallable<report.Request, report.Response>(
  functions,
  "adminResolveReport"
)
