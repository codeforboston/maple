import type { Role } from "../auth/types"

/** A cosign names both its parent's id and author, and carries a note at
 * most: no attachment, and possibly no content. Anything else has content.
 * A runtype constraint on drafts, here and on the website. */
export const cosignShape = ({
  content,
  attachmentId,
  cosignOfId,
  cosignOfAuthorUid
}: {
  content: string
  attachmentId?: string | null
  cosignOfId?: string | null
  cosignOfAuthorUid?: string | null
}) => {
  if (!cosignOfId !== !cosignOfAuthorUid)
    return "A cosign names its parent's id and author"
  if (cosignOfId) return !attachmentId || "A cosign takes no attachment"
  return content.length > 0 || "Content is empty"
}

/** Why `uid` cannot cosign `parent`, if they cannot: an individual's or an
 * organization's testimony can be cosigned, never a legislator's, a cosign or
 * one's own. Publishing refuses with it; the website offers no Cosign. */
export const cosignRefusal = (
  uid: string | undefined,
  parent: { authorUid: string; authorRole: Role; cosignOfId?: string | null }
) =>
  parent.authorUid === uid
    ? "You cannot cosign your own testimony"
    : parent.cosignOfId
    ? "A cosign cannot be cosigned"
    : parent.authorRole === "legislator"
    ? "A legislator's testimony cannot be cosigned"
    : undefined
