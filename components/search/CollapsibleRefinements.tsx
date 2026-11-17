import { useTranslation } from "next-i18next"
import { useRef, useState } from "react"
import {
  useCurrentRefinements,
  UseCurrentRefinementsProps
} from "react-instantsearch"
import { useIsomorphicLayoutEffect } from "usehooks-ts"

type Item = ReturnType<typeof useCurrentRefinements>["items"][number]

/** How many lines of tags a group shows before the rest fold away. */
const LINES = 2

const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1)

/**
 * The search's current filters, drawn as InstantSearch's CurrentRefinements
 * draws them (the same markup and classes, so SearchContainer's styles
 * apply), except that a group whose tags run past two lines shows only the
 * tags that fit on two, then a "+ N more" button that shows the rest. A
 * topic chosen on the homepage selects dozens of tags.
 */
export const CollapsibleRefinements = (props: UseCurrentRefinementsProps) => {
  const { items, canRefine } = useCurrentRefinements(props)

  return (
    <div
      className={`ais-CurrentRefinements${
        canRefine ? "" : " ais-CurrentRefinements--noRefinement"
      }`}
    >
      <ul className="ais-CurrentRefinements-list">
        {items.map(item => (
          <RefinementGroup
            key={[item.indexName, item.label].join("/")}
            item={item}
          />
        ))}
      </ul>
    </div>
  )
}

const RefinementGroup = ({ item }: { item: Item }) => {
  const { t } = useTranslation("search")
  const ref = useRef<HTMLLIElement>(null)
  const [expanded, setExpanded] = useState(false)
  // How many tags show while folded: null while every tag is drawn to be
  // measured, then the number that fit on two lines with the button.
  const [shown, setShown] = useState<number | null>(null)
  // The bottom of the second line, from the last measurement.
  const lineEnd = useRef(0)
  const [width, setWidth] = useState(0)

  const total = item.refinements.length
  const tags = item.refinements.map(r => r.label).join("\u0000")

  // Measure again from every tag whenever the tags or the width change.
  useIsomorphicLayoutEffect(() => setShown(null), [tags, width])

  // The outer box's width, not the list's: the list is only as wide as its
  // tags, so it would change as they fold and measure itself in a loop.
  useIsomorphicLayoutEffect(() => {
    const root = ref.current?.closest(".ais-CurrentRefinements")
    if (!root || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.round(entry.contentRect.width))
    )
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  // With every tag drawn, find where the third line starts.
  useIsomorphicLayoutEffect(() => {
    if (shown !== null || !ref.current) return
    const pills = Array.from(
      ref.current.querySelectorAll<HTMLElement>(
        ".ais-CurrentRefinements-category"
      )
    )
    let line = 1
    let bottom = -Infinity
    for (let i = 0; i < pills.length; i++) {
      const box = pills[i].getBoundingClientRect()
      if (i > 0 && box.top > bottom) {
        line++
        if (line > LINES) {
          setShown(i)
          return
        }
      }
      bottom = Math.max(bottom, box.bottom)
      lineEnd.current = bottom
    }
    setShown(total)
  }, [shown, total])

  // Folded, give up tags until the button fits on the second line too.
  useIsomorphicLayoutEffect(() => {
    if (expanded || shown === null || shown >= total || shown === 0) return
    const more = ref.current?.querySelector<HTMLElement>(
      ".ais-CurrentRefinements-more"
    )
    if (more && more.getBoundingClientRect().top > lineEnd.current)
      setShown(shown - 1)
  }, [expanded, shown, total])

  const folds = shown !== null && shown < total
  const visible =
    expanded || !folds ? item.refinements : item.refinements.slice(0, shown)

  return (
    <li ref={ref} className="ais-CurrentRefinements-item">
      <span className="ais-CurrentRefinements-label">
        {capitalize(item.label)}:{" "}
      </span>
      {visible.map(refinement => (
        <span
          key={refinement.label}
          className="ais-CurrentRefinements-category"
        >
          <span className="ais-CurrentRefinements-categoryLabel">
            {refinement.label}
          </span>
          <button
            type="button"
            className="ais-CurrentRefinements-delete"
            aria-label={t("remove_tag", { label: refinement.label })}
            onClick={() => item.refine(refinement)}
          >
            {/* The cross InstantSearch draws; the label above names it. */}
            <span aria-hidden="true">{"\u2715"}</span>
          </button>
        </span>
      ))}
      {folds && (
        <button
          type="button"
          className="ais-CurrentRefinements-more"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded
            ? t("show_fewer_tags")
            : t("show_more_tags", { count: total - visible.length })}
        </button>
      )}
    </li>
  )
}
