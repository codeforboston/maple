import { useTranslation } from "next-i18next"
import {
  FocusEvent,
  MouseEvent,
  ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from "react"
import styled from "styled-components"

/** Where feedback on the site goes. */
export const FEEDBACK_EMAIL = "info@mapletestimony.org"

/** A small dark tip: to the right of what copies, centred beside it
 * (placeTip), or, for an address in a line, below and right of the pointer,
 * following it (placeAtPointer); moved left only as far as it must to stay
 * in the window. "Copy" while it is pointed at or focused,
 * "Copied!" once it has copied. Only for the eye: the copy is read out by the
 * live region beside it (Copier). */
const Tip = styled.span`
  position: absolute;
  /* 0.5rem to the right of what copies, centred down it. */
  top: 50%;
  left: calc(100% + 0.5rem);
  transform: translateY(-50%);
  z-index: 2;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: rgba(15, 23, 42, 0.92);
  color: #fff;
  font-family: var(--maple-font-body);
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.3;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  /* As the site's other tooltips (InfoTooltip, Bootstrap's .fade): shown at
     once, fading in and out over 0.15s. */
  transition: opacity 0.15s linear;

  /* By the pointer, placed by its own left and top (placeAtPointer). */
  &[data-pointer] {
    transform: none;
  }
`

/** The gap, in px, the tip keeps from the window's right edge. */
const EDGE = 8

/**
 * Keeps the tip in the window: where to the right of what copies it would
 * run off the window's right, moves it left by as much as it would, and no
 * more. Measured as it is about to show, the tip there already, unseen, at
 * its current width.
 */
function placeTip(wrap: HTMLElement | null, tip: HTMLElement | null) {
  if (!wrap || !tip) return
  delete tip.dataset.pointer
  tip.style.left = ""
  tip.style.top = ""
  const over = tip.getBoundingClientRect().right - (window.innerWidth - EDGE)
  if (over > 0) tip.style.left = `calc(100% + 0.5rem - ${over}px)`
}

/** How far below and right of the pointer the tip sits, in px. */
const POINTER_OFFSET = { x: 16, y: 22 }

/**
 * Puts the tip below and right of the pointer, as it comes in and as it
 * moves, and no further right than the window allows. Placed against what
 * copies (its containing block), so a transformed panel around it doesn't
 * throw it off.
 */
function placeAtPointer(
  wrap: HTMLElement | null,
  tip: HTMLElement | null,
  e: { clientX: number; clientY: number }
) {
  if (!wrap || !tip) return
  const box = wrap.getBoundingClientRect()
  const x = Math.min(
    e.clientX + POINTER_OFFSET.x,
    window.innerWidth - EDGE - tip.offsetWidth
  )
  tip.dataset.pointer = "true"
  tip.style.left = `${x - box.left}px`
  tip.style.top = `${e.clientY - box.top + POINTER_OFFSET.y}px`
}

/** What copies and its tip, the tip placed against it and shown while it is
 * pointed at, focused from the keyboard (not merely left focused by a
 * click), or has just copied (`$flash`). */
const Wrap = styled.span<{ $flash: boolean; $follow: boolean }>`
  position: relative;

  /* No "Copy" when pointed at or focused, only "Copied!" once it has. */
  &:hover ${Tip}[data-copied], &:has(:focus-visible) ${Tip}[data-copied] {
    opacity: 1;
  }
  ${({ $flash }) => ($flash ? `${Tip} { opacity: 1; }` : "")}
  /* A tip that follows the pointer ($follow) goes at once when the pointer
     leaves. "Copied!", which stays put rather than follow, fades out. */
  ${({ $follow }) =>
    $follow
      ? `${Tip} { transition: none; }
         &:hover ${Tip}, &:has(:focus-visible) ${Tip},
         ${Tip}[data-copied] { transition: opacity 0.15s linear; }`
      : ""}
`

/** The email, a button that copies it, set as a link in the line: no button
 * padding, background or border, the line's own colour and type, bold and
 * underlined. */
const Button = styled.button`
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  font-weight: 700;
  color: inherit;
  vertical-align: baseline;
  text-decoration: underline;
  text-underline-offset: 0.16em;
  cursor: pointer;
`

/** How long the tip stays up after a copy without the pointer on it, and
 * how long it takes to fade (Tip's transition). */
const FLASH_MS = 1000
const FADE_MS = 150

/**
 * Copying `email`. `copied`: the tip reads "Copied!", from a copy until the
 * reader has left (the pointer gone, and keyboard focus gone; focus a click
 * leaves behind does not count) and the tip has faded, so "Copy" never comes
 * back while they are still there. Coming back, it reads "Copy" again.
 * `flash`: the tip shown for a moment after the copy, pointed at or not.
 */
function useCopy(email: string) {
  const [copied, setCopied] = useState(false)
  const [flash, setFlash] = useState(false)
  const hovered = useRef(false)
  const focused = useRef(false)
  const flashing = useRef(false)
  // Gone since the copy: coming back starts over at "Copy".
  const left = useRef(false)
  const flashTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(
    () => () => {
      clearTimeout(flashTimer.current)
      clearTimeout(resetTimer.current)
    },
    []
  )
  // Back to "Copy" once the reader has gone and the tip has faded out.
  const resetIfGone = () => {
    if (hovered.current || focused.current || flashing.current) return
    clearTimeout(resetTimer.current)
    resetTimer.current = setTimeout(() => setCopied(false), FADE_MS + 50)
  }
  // Where the browser can't copy (no clipboard, or it refuses), the mail app
  // opens instead.
  const openMail = () => {
    window.location.href = `mailto:${email}`
  }
  const copy = () => {
    if (!navigator.clipboard) return openMail()
    void navigator.clipboard.writeText(email).then(() => {
      clearTimeout(flashTimer.current)
      clearTimeout(resetTimer.current)
      left.current = false
      setCopied(true)
      setFlash(true)
      flashing.current = true
      flashTimer.current = setTimeout(() => {
        flashing.current = false
        setFlash(false)
        resetIfGone()
      }, FLASH_MS)
    }, openMail)
  }
  const track = (which: typeof hovered, inside: boolean) => {
    const wasThere = hovered.current || focused.current
    which.current = inside
    const there = hovered.current || focused.current
    if (there && !wasThere && left.current) {
      // Back after leaving: "Copy" again, not the copy's "Copied!".
      left.current = false
      clearTimeout(flashTimer.current)
      clearTimeout(resetTimer.current)
      flashing.current = false
      setFlash(false)
      setCopied(false)
    } else if (!there && wasThere) {
      left.current = true
      resetIfGone()
    }
  }
  return {
    copied,
    flash,
    copy,
    onMouseEnter: () => track(hovered, true),
    onMouseLeave: () => track(hovered, false),
    // Keyboard focus only: a click focuses the button too, and that should
    // not hold the reader "there" after the pointer has gone.
    onFocus: (e: FocusEvent) =>
      track(focused, (e.target as Element).matches(":focus-visible")),
    onBlur: () => track(focused, false)
  }
}

/** What copies (`children`, given `copy` to call), its tip, and a live region
 * that reads out "Copied!" once it has. */
function Copier({
  email,
  follow = false,
  children
}: {
  email: string
  /** The tip follows the pointer, rather than sitting at the corner. */
  follow?: boolean
  children: (copy: () => void, copied: boolean) => ReactNode
}) {
  const { t } = useTranslation("common")
  const { copied, flash, copy, ...track } = useCopy(email)
  const wrap = useRef<HTMLSpanElement>(null)
  const tip = useRef<HTMLSpanElement>(null)
  // Placed again as its words change, "Copied!" being wider than "Copy",
  // unless it is by the pointer, which places it as it moves.
  useLayoutEffect(() => {
    if (!tip.current?.dataset.pointer) placeTip(wrap.current, tip.current)
  }, [copied])
  return (
    <Wrap
      ref={wrap}
      $flash={flash}
      $follow={follow}
      {...track}
      onMouseEnter={(e: MouseEvent) => {
        if (follow) placeAtPointer(wrap.current, tip.current, e)
        else placeTip(wrap.current, tip.current)
        track.onMouseEnter()
      }}
      // Once it reads "Copied!", it stays where it is rather than follow.
      onMouseMove={(e: MouseEvent) => {
        if (follow && !copied) placeAtPointer(wrap.current, tip.current, e)
      }}
      onFocus={(e: FocusEvent) => {
        // At the corner from the keyboard; a click focuses it too, and would
        // take a following tip away from the pointer.
        if (!follow || (e.target as Element).matches(":focus-visible"))
          placeTip(wrap.current, tip.current)
        track.onFocus(e)
      }}
    >
      {children(copy, copied)}
      <Tip ref={tip} aria-hidden data-copied={copied ? "" : undefined}>
        {t(copied ? "copied" : "copy")}
      </Tip>
      <span className="visually-hidden" aria-live="polite">
        {copied ? t("copied") : ""}
      </span>
    </Wrap>
  )
}

/**
 * An email address in a line of text that copies itself rather than opening
 * a mail app, saying "Copied!" by the pointer once it has. Where the browser
 * can't copy, a plain email link instead. Shows `children` where given (as
 * Trans passes the address in), or the address.
 */
export function CopyEmail({
  email = FEEDBACK_EMAIL,
  children
}: {
  email?: string
  children?: ReactNode
}) {
  const { t } = useTranslation("common")
  // Whether the browser can copy: known only once in the browser, so the
  // page is first drawn as if it can, as the server draws it.
  const [canCopy, setCanCopy] = useState(true)
  useEffect(() => setCanCopy(Boolean(navigator.clipboard)), [])
  // Where it can't, a plain email link, with no "Copy" tip.
  if (!canCopy)
    return (
      <Button as="a" href={`mailto:${email}`}>
        {children ?? email}
      </Button>
    )
  return (
    <Copier email={email} follow>
      {copy => (
        <Button
          type="button"
          onClick={copy}
          aria-label={t("copyEmail", { email })}
        >
          {children ?? email}
        </Button>
      )}
    </Copier>
  )
}
