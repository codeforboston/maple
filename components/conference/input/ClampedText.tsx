import { useEffect, useRef, useState } from "react"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { brand, ink, red } from "./tokens"

const Wrap = styled.div`
  position: relative;
`

/** The text and its measuring twin are set identically; Entry sets unclamped
 * text with it too. */
export const Body = styled.p<{ $small: boolean }>`
  margin: 0;
  font-size: ${({ $small }) => ($small ? "0.8125rem" : "0.875rem")};
  line-height: 1.55;
  color: ${ink.strong};
  white-space: pre-line;
`

const Measure = styled(Body)`
  position: absolute;
  visibility: hidden;
  pointer-events: none;
`

const More = styled.button`
  border: 0;
  padding: 0;
  background: none;
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${brand.fill};
  &:hover {
    color: ${red.hover};
  }
`

/**
 * Text cut where `lines` lines end, with "Show more" run on at the cut. The
 * cut is found by measuring a hidden copy, so the control sits on the last
 * line rather than under it.
 */
export function ClampedText({
  text,
  lines = 6,
  small = false
}: {
  text: string
  lines?: number
  /** A step down, for a card too narrow for the full size. */
  small?: boolean
}) {
  const { t } = useTranslation("conferences")
  const [expanded, setExpanded] = useState(false)
  const [cutoff, setCutoff] = useState<number | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const m = measureRef.current
    if (!wrap || !m) return
    // Only a new width moves the cut; expanding changes the height alone.
    let measured = -1
    const compute = () => {
      if (wrap.clientWidth === measured) return
      measured = wrap.clientWidth
      m.style.width = `${measured}px`
      const maxH = parseFloat(getComputedStyle(m).lineHeight) * lines + 2
      m.textContent = text
      if (m.scrollHeight <= maxH) return setCutoff(null)
      let lo = 0
      let hi = text.length
      while (lo < hi) {
        const mid = Math.ceil((lo + hi) / 2)
        m.textContent = `${text.slice(0, mid).trimEnd()}… ${t(
          "input.show_more"
        )}`
        if (m.scrollHeight <= maxH) lo = mid
        else hi = mid - 1
      }
      setCutoff(lo)
    }
    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [text, lines, small, t])

  const collapsed = !expanded && cutoff !== null
  return (
    <Wrap ref={wrapRef}>
      <Measure ref={measureRef} aria-hidden $small={small} />
      <Body $small={small}>
        {collapsed ? `${text.slice(0, cutoff!).trimEnd()}… ` : `${text} `}
        {cutoff !== null && (
          <More type="button" onClick={() => setExpanded(x => !x)}>
            {expanded ? t("input.show_less") : t("input.show_more")}
          </More>
        )}
      </Body>
    </Wrap>
  )
}
