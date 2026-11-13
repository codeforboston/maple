/**
 * The site navbar, as the conference page pins under it. On desktop it is
 * sticky, but inside the layout's one-window-tall box, so it lets go and
 * scrolls away once the page is about a window down. Below its breakpoint it
 * is not sticky at all.
 */
function navbar() {
  // On the Conference Committees page the section's beta note sticks at the
  // top once it reaches it, where the navbar scrolls away (styles/globals.css):
  // what pins under the navbar pins under the note there.
  const nav =
    document.querySelector<HTMLElement>(".conference-beta-banner") ??
    document.querySelector<HTMLElement>(".main-navbar")
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
