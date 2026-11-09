/**
 * The site navbar, as the conference page pins under it. On desktop it is
 * sticky, but inside the layout's one-window-tall box, so it lets go and
 * scrolls away once the page is about a window down. Below its breakpoint it
 * is not sticky at all.
 */
function navbar() {
  const nav = document.querySelector<HTMLElement>(".main-navbar")
  if (!nav?.parentElement || getComputedStyle(nav).position !== "sticky")
    return { height: 0, letsGo: 0 }
  return {
    height: nav.offsetHeight,
    // Where the page has scrolled to when the bar's bottom edge reaches the
    // window's top.
    letsGo: nav.parentElement.getBoundingClientRect().bottom + window.scrollY
  }
}

const bottomAt = (y: number, { height, letsGo }: ReturnType<typeof navbar>) =>
  Math.max(0, Math.min(height, letsGo - y))

/** Where the navbar's bottom edge is in the window now: its height while it
 * holds, less as it goes, none once it has gone. */
export const navbarBottom = () => bottomAt(window.scrollY, navbar())

/** Ends the jump under way, if one is. */
let endJump: (() => void) | undefined

/** Whether a jump is on its way, which the hero's snap waits out. */
export const jumping = () => endJump !== undefined

/**
 * Scrolls `el` to its scroll margin under the navbar, where the navbar will be
 * on arrival. The browser's own jump takes the margin as it is before the
 * scroll, so a section far enough down that the navbar lets go on the way
 * would land a navbar's height too low.
 */
export function jumpTo(el: HTMLElement) {
  const bar = navbar()
  const below =
    parseFloat(getComputedStyle(el).scrollMarginTop) -
    bottomAt(window.scrollY, bar)
  const top = el.getBoundingClientRect().top + window.scrollY - below
  // Short of where the navbar lets go it is there on arrival, taking its
  // height; past it, it is gone. Partly gone has no resting place to aim at.
  const to = top <= bar.letsGo ? top - bar.height : top
  // The hero's snap, on near the conference's top, would snap the landing
  // too, holding a jump to a section further down short of it. Off for the
  // jump, and held off until it arrives: the hero turns it back on near the
  // top, which cuts a smooth jump from there short on its first frame.
  const root = document.documentElement
  root.style.scrollSnapType = ""
  endJump?.()
  // A scroll already running when the jump began ends too; only arriving
  // ends this one. The page may be too short to reach `to`.
  const arrived = () => {
    const most = root.scrollHeight - window.innerHeight
    if (Math.abs(window.scrollY - Math.min(to, most)) < 2) end()
  }
  // A jump to where the reader already is, or one they take over, never
  // arrives.
  const timer = setTimeout(() => end(), 2000)
  const end = () => {
    window.removeEventListener("scrollend", arrived)
    clearTimeout(timer)
    endJump = undefined
  }
  endJump = end
  window.addEventListener("scrollend", arrived)
  window.scrollTo({
    top: to,
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth"
  })
}

/** Jumps to the section with this id and puts it in the address, as a link
 * to it would. */
export function jumpToSection(id: string) {
  const el = document.getElementById(id)
  if (el) jumpTo(el)
  putHash(id)
}

/** Puts a section's id in the address, keeping Next's state: on Back to a
 * null-state entry Next only rewrites the URL, leaving the page it came from
 * on screen. Its as path takes the hash, since Back restores that path. */
export function putHash(id: string) {
  const state = history.state
  const as = state?.as && `${state.as.split("#")[0]}#${id}`
  history.replaceState(as ? { ...state, as } : state, "", `#${id}`)
}
