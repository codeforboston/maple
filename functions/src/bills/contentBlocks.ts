import { db } from "../firebase"

/**
 * Max UTF-8 bytes of bill text kept inline on the bill document. Above this the
 * whole bill document risks exceeding Firestore's 1 MiB (1,048,576 byte) limit,
 * so the text is chunked into the `contentBlocks` subcollection instead. Leaves
 * ~148 KB of headroom for the rest of the document (history, cosponsors, etc.).
 */
export const MAX_INLINE_TEXT_BYTES = 900_000

/**
 * Max UTF-8 bytes of `text` stored in a single content block document. Keeps
 * each block document comfortably under the 1 MiB limit.
 */
export const MAX_BLOCK_BYTES = 900_000

export type DocumentTextStoragePlan =
  | { inline: string | undefined; blocks?: undefined }
  | { inline?: undefined; blocks: string[] }

/**
 * Decide how a bill's `DocumentText` should be stored. Text that fits within
 * {@link MAX_INLINE_TEXT_BYTES} (or is absent) stays inline; anything larger is
 * split into chunks for the `contentBlocks` subcollection. Pure and easily
 * tested — the Firestore writes live in {@link writeDocumentTextBlocks}.
 */
export function planDocumentTextStorage(
  text: string | undefined
): DocumentTextStoragePlan {
  if (text == null || byteLength(text) <= MAX_INLINE_TEXT_BYTES) {
    return { inline: text }
  }
  return { blocks: chunkDocumentText(text) }
}

/**
 * Split `text` into chunks each at most {@link MAX_BLOCK_BYTES} UTF-8 bytes,
 * never splitting a Unicode code point, such that `chunks.join("") === text`.
 */
export function chunkDocumentText(text: string): string[] {
  const chunks: string[] = []
  let current = "",
    currentBytes = 0

  // Iterating a string yields whole code points, keeping surrogate pairs intact.
  for (const codePoint of text) {
    const codePointBytes = byteLength(codePoint)
    if (current && currentBytes + codePointBytes > MAX_BLOCK_BYTES) {
      chunks.push(current)
      current = ""
      currentBytes = 0
    }
    current += codePoint
    currentBytes += codePointBytes
  }
  if (current) chunks.push(current)

  return chunks
}

function billContentBlocksRef(court: number, id: string) {
  return db.collection(`/generalCourts/${court}/bills/${id}/contentBlocks`)
}

/**
 * Replace a bill's content blocks with `blocks`, deleting any existing chunks
 * first so a shrinking bill does not leave stale blocks behind. Each block is
 * stored as `{ index, text }` and ordered by `index` on read.
 */
export async function writeDocumentTextBlocks(
  court: number,
  id: string,
  blocks: string[]
): Promise<void> {
  const ref = billContentBlocksRef(court, id)
  await db.recursiveDelete(ref)

  const writer = db.bulkWriter()
  blocks.forEach((text, index) => {
    writer.set(ref.doc(String(index)), { index, text })
  })
  await writer.close()
}

/** Delete any content blocks for a bill (used when its text now fits inline). */
export async function clearDocumentTextBlocks(
  court: number,
  id: string
): Promise<void> {
  await db.recursiveDelete(billContentBlocksRef(court, id))
}

function byteLength(s: string): number {
  return Buffer.byteLength(s, "utf8")
}
