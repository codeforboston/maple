import { useCallback, useEffect, useRef, useState } from "react"
import {
  ConferenceWorkingDraft,
  UseEditConferenceTestimony
} from "components/db"

/** Autosave's two timings, as in the mockup: what was just saved shows for a
 * couple of seconds and then goes. */
const SAVE_AFTER = 1200
const SAVED_FOR = 2000

/**
 * Keeps the user's draft as they type, and publishes it once the draft the
 * hook holds is what is on screen.
 *
 * Saving what the draft already holds fires no snapshot, which would leave the
 * edit hook waiting on one, so only a differing draft is saved; and publishing
 * reads the held draft, which follows a save by a snapshot, so a post waits
 * for it.
 */
export function useAutosave<F>({
  edit,
  fields,
  matches,
  write,
  active = true,
  idle = () => false,
  onPosted
}: {
  edit: UseEditConferenceTestimony
  /** What is on screen. Plain values: a change to any of them is a change. */
  fields: F
  /** Whether the draft already holds `fields`. */
  matches: (draft: ConferenceWorkingDraft | undefined, fields: F) => boolean
  write: (fields: F) => Promise<void>
  /** Whether typing here is kept; arriving is not a change. */
  active?: boolean
  /** Fields not worth keeping yet, such as no words at all. */
  idle?: (fields: F) => boolean
  /** The draft is on the record. */
  onPosted: () => void
}) {
  const [save, setSave] = useState<"none" | "saving" | "saved" | "fading">(
    "none"
  )
  const [posting, setPosting] = useState(false)
  const held = useRef(edit.draft)
  held.current = edit.draft
  const shown = useRef(fields)
  shown.current = fields
  const inSync = () => matches(held.current, shown.current)
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const touched = useRef(false)
  const dirty = useRef(false)
  // A write in flight, for a handler called before saveDraft.loading has
  // rendered.
  const inFlight = useRef(false)
  const keep = async (f: F) => {
    inFlight.current = true
    try {
      await write(f)
    } finally {
      inFlight.current = false
    }
  }

  const key = JSON.stringify(fields)
  useEffect(() => {
    if (!active) return
    if (!touched.current) {
      touched.current = true
      return
    }
    if (idle(shown.current) || inSync()) {
      dirty.current = false
      return setSave("none")
    }
    dirty.current = true
    setSave("saving")
    timer.current = setTimeout(async () => {
      try {
        await keep(shown.current)
        dirty.current = false
        setSave("saved")
      } catch {
        // A failure shows through saveDraft.error.
        setSave("none")
      }
    }, SAVE_AFTER)
    return () => clearTimeout(timer.current)
    // The fields are what matter; the callbacks are new each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, key])

  useEffect(() => {
    if (save !== "saved") return
    const fade = setTimeout(() => setSave("fading"), SAVED_FOR)
    const gone = setTimeout(() => setSave("none"), SAVED_FOR + 600)
    return () => {
      clearTimeout(fade)
      clearTimeout(gone)
    }
  }, [save])

  /** Saves now what a pending save would, if the draft differs. A write
   * already in flight goes first; a post waiting on it saves the rest. */
  const flush = async () => {
    clearTimeout(timer.current)
    dirty.current = false
    setSave("none")
    if (!inFlight.current && !inSync()) await keep(shown.current)
  }

  const post = async () => {
    setPosting(true)
    try {
      await flush()
    } catch {
      // A failure shows through saveDraft.error, and the post can be retried.
      setPosting(false)
    }
  }
  // The edit hook drops a save made while it loads the draft, so a post that
  // finds the draft behind once it settles saves again.
  useEffect(() => {
    if (!posting || edit.draftLoading) return
    if (!inSync()) {
      if (!edit.saveDraft.loading)
        keep(shown.current).catch(() => setPosting(false))
      return
    }
    setPosting(false)
    // A failure shows through publishTestimony.error.
    edit.publishTestimony.execute().then(onPosted, () => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posting, edit.draft, edit.draftLoading, edit.saveDraft.loading])

  const reset = useCallback(() => setSave("none"), [])

  return {
    save,
    /** Typed and not yet kept. */
    dirty: dirty.current,
    posting,
    post,
    flush,
    reset
  }
}
