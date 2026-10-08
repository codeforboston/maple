import { useEffect, useState } from "react"

/**
 * The rotating placeholder in the hero's ask field: a static lead-in, then
 * phrases that type in and delete a character at a time, as on the Digital
 * Democracy homepages.
 *
 * Demo copy, not translated yet: these are placeholders for whatever the real
 * prompts turn out to be.
 */
const phrases = [
  "Bills: sponsors, hearings, testimony",
  "Legislators: votes, committees, funding",
  "Hearings: videos, transcriptions, outcomes",
  "Civic Orgs: priorities, stances, testimony",
  "Testimony: sharing yours, reading others",
  "Issues: healthcare, education, etc."
]

const TYPE_MS = 95
const DELETE_MS = 55
/** How long a completed phrase sits before it starts deleting. */
const HOLD_MS = 1700
/** A beat of empty field before the next phrase starts. */
const GAP_MS = 400

export function TypedPrompt() {
  const [phrase, setPhrase] = useState(0)
  const [length, setLength] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [animate, setAnimate] = useState(true)

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    setAnimate(!query.matches)
  }, [])

  useEffect(() => {
    if (!animate) return

    const current = phrases[phrase]
    let delay = deleting ? DELETE_MS : TYPE_MS

    if (!deleting && length === current.length) delay = HOLD_MS
    if (deleting && length === 0) delay = GAP_MS

    const timer = window.setTimeout(() => {
      if (!deleting && length === current.length) {
        setDeleting(true)
      } else if (deleting && length === 0) {
        setDeleting(false)
        setPhrase(p => (p + 1) % phrases.length)
      } else {
        setLength(n => n + (deleting ? -1 : 1))
      }
    }, delay)

    return () => window.clearTimeout(timer)
  }, [animate, phrase, length, deleting])

  /* Without motion the field still has to say something, so it shows the first
     prompt in full. */
  const text = animate ? phrases[phrase].slice(0, length) : phrases[0]

  return (
    <span aria-live="off">
      {text}
      {animate && <span aria-hidden="true">|</span>}
    </span>
  )
}

export default TypedPrompt
