import { useEffect, useRef, useState } from "react"
import {
  ConferenceWorkingDraft,
  UseEditConferenceTestimony
} from "components/db"

/**
 * Posts what is on screen. Nothing is kept before then: publishing reads a
 * draft by its id, so a post writes the fields to the draft and publishes
 * once the edit hook holds that write.
 *
 * Saving what the draft already holds fires no snapshot, which would leave the
 * edit hook waiting on one, so only a differing draft is written; and the edit
 * hook drops a save made while it loads the draft, so the write waits for it.
 */
export function usePost<F>({
  edit,
  fields,
  matches,
  write,
  onPosted
}: {
  edit: UseEditConferenceTestimony
  /** What is on screen. */
  fields: F
  /** Whether the draft already holds `fields`. */
  matches: (draft: ConferenceWorkingDraft | undefined, fields: F) => boolean
  write: (fields: F) => Promise<void>
  /** The words are on the record. */
  onPosted: () => void
}) {
  const [posting, setPosting] = useState(false)
  const shown = useRef(fields)
  shown.current = fields

  useEffect(() => {
    // The draft's snapshot shows a write before the server has it, and
    // publishing reads the server's draft, so a post waits out the write too.
    if (!posting || edit.draftLoading || edit.saveDraft.loading) return
    if (!matches(edit.draft, shown.current)) {
      // A failure shows through saveDraft.error, and the post can be retried.
      write(shown.current).catch(() => setPosting(false))
      return
    }
    setPosting(false)
    // A failure shows through publishTestimony.error.
    edit.publishTestimony.execute().then(onPosted, () => {})
    // The callbacks are new each render; the draft is what matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posting, edit.draft, edit.draftLoading, edit.saveDraft.loading])

  return { posting, post: () => setPosting(true) }
}
