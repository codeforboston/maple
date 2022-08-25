import { nanoid } from "nanoid"
import { fail, Maybe } from "../common"
import { File, storage } from "../firebase"
import { DraftTestimony } from "./types"

export type PublishedAttachmentState = {
  prevId: string | null
  id: string | null
  draftId: string | null
  title: string | null
  uid: string
}

/** Handles publishing and deleting testimony attachments. */
export class Attachments {
  private files = {
    published: (id: string) =>
      storage.bucket().file(`publishedAttachments/${id}`),
    archived: (uid: string, id: string) =>
      storage.bucket().file(`users/${uid}/archivedAttachments/${id}`),
    draft: (uid: string, id: string) =>
      storage.bucket().file(`users/${uid}/draftAttachments/${id}`)
  }

  /** Deletes the given published attachment */
  async applyDelete(attachmentId: Maybe<string>) {
    if (attachmentId) await this.deletePublishedAttachment(attachmentId)
  }

  /** Runs inside a transaction to determine changes to attachment state. */
  async resolvePublish({
    draft,
    publishedDraftId,
    publishedId,
    uid,
    profile
  }: {
    draft: Maybe<DraftTestimony>
    publishedDraftId: Maybe<string>
    publishedId: Maybe<string>
    uid: string
    profile: any
  }): Promise<PublishedAttachmentState> {
    const draftId = draft?.attachmentId
    if (draftId) await this.checkDraftAttachmentExists(uid, draftId)

    const prevId = publishedId ?? null

    if (!draftId) {
      return { id: null, draftId: null, prevId, uid, title: null }
    }

    const attachmentChanged = draftId !== publishedDraftId
    const id = attachmentChanged ? nanoid() : publishedId ?? null
    const title = ["Testimony", draft.billId, profile?.displayName]
      .filter(Boolean)
      .join(", ")

    return { id, draftId, prevId, uid, title }
  }

  /** Applies the given update to the storage objects. This should run outside
   * the transaction. */
  async applyPublish({
    draftId,
    id,
    prevId,
    uid,
    title
  }: PublishedAttachmentState) {
    if (id && !(await this.publishedAttachmentExists(id))) {
      // Copy the draft attachment to publications and archive if present
      const draft = this.files.draft(uid, draftId!)
      await this.copy(
        title ?? "Testimony",
        draft,
        this.files.archived(uid, id),
        this.files.published(id)
      )
    }

    const isPreviousPublishedAttachmentObsolete = prevId && prevId !== id
    if (isPreviousPublishedAttachmentObsolete) {
      // Delete the old attachment if present and no longer published
      await this.deletePublishedAttachment(prevId)
    }
  }

  private async deletePublishedAttachment(id: string) {
    await this.files.published(id).delete({ ignoreNotFound: true })
  }

  private async publishedAttachmentExists(id: string) {
    const [exists] = await this.files.published(id).exists()
    return exists
  }

  private async checkDraftAttachmentExists(uid: string, id: string) {
    const [exists] = await this.files.draft(uid, id).exists()
    if (!exists) {
      throw fail(
        "failed-precondition",
        `Draft testimony has invalid attachment ID ${id}`
      )
    }
  }

  private async copy(title: string, from: File, ...to: File[]) {
    // TODO: Update firebase-tools and use copy API directly. Only the emulators
    // in firebase-tools 10.5+ support the copy API, but they have can't import
    // previously exported storage data which breaks tests... Once that bug is
    // fixed, update firebase-tools and use the Copy API directly.
    //
    // await from.copy(to)

    const [data] = await from.download()
    await Promise.all(
      to.map(file =>
        file.save(data, {
          contentType: "application/pdf",
          metadata: {
            cacheControl: "public, max-age=3600",
            contentDisposition: `inline; filename="${title}.pdf"`
          },
          resumable: false,
          gzip: false
        })
      )
    )
  }
}
