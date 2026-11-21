import { useEffect, useReducer } from "react"

/** Firebase refuses a second verification email to the same account within
 * about a minute of the last one, with auth/too-many-requests. The wait isn't
 * documented; a minute is what we measured on production. */
export const VERIFICATION_EMAIL_COOLDOWN_MS = 60_000

const storageKey = (uid: string) => `verificationEmailSentAt:${uid}`

/** For when storage is unavailable (private browsing, blocked cookies), so the
 * wait still holds for as long as the page is open. */
const sentAtThisPage = new Map<string, number>()

/** Notes that a verification email just went to this account, so the button
 * isn't offered again before Firebase would accept it, even after a reload. */
export function recordVerificationEmailSent(uid: string, now = Date.now()) {
  sentAtThisPage.set(uid, now)
  try {
    localStorage.setItem(storageKey(uid), String(now))
  } catch {
    // The in-page record above still applies.
  }
}

/** Milliseconds until another verification email can be asked for; 0 when it
 * can be asked for now. */
export function verificationEmailWaitMs(uid: string, now = Date.now()) {
  let stored = 0
  try {
    stored = Number(localStorage.getItem(storageKey(uid))) || 0
  } catch {
    // Fall back to the in-page record.
  }
  const sentAt = Math.max(stored, sentAtThisPage.get(uid) ?? 0)
  if (!sentAt) return 0
  const wait = sentAt + VERIFICATION_EMAIL_COOLDOWN_MS - now
  return Math.min(Math.max(wait, 0), VERIFICATION_EMAIL_COOLDOWN_MS)
}

/** Whether a verification email went to this account within the last minute.
 * Turns false by itself once the minute is up. */
export function useRecentVerificationEmail(uid: string) {
  const [, rerender] = useReducer((n: number) => n + 1, 0)
  const waitMs = verificationEmailWaitMs(uid)
  useEffect(() => {
    if (waitMs <= 0) return
    const timer = setTimeout(rerender, waitMs)
    return () => clearTimeout(timer)
  }, [waitMs])
  return waitMs > 0
}
