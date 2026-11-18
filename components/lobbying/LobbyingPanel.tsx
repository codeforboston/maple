import {
  faChevronDown,
  faChevronRight,
  faXmark
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React from "react"
import { useTranslation } from "next-i18next"
import { MAPLE_COLORS } from "./chartTheme"
import { lobbyingErrorMessage } from "./errorMessage"
import type { SessionFilter } from "./SessionSelect"
import styles from "./lobbying.module.css"
import { sessionYears } from "./sessions"

/**
 * The white card each Lobbying Explorer section sits in: an uppercase title,
 * an optional line beside it (a count or a hint), the content, and an
 * optional footer under a dashed rule.
 */
export function LobbyingPanel({
  title,
  session,
  sessions,
  hint,
  titleNote,
  aside,
  filters,
  filtersAt,
  footer,
  children,
  style
}: React.PropsWithChildren<{
  title: React.ReactNode
  /** The session the panel shows, whose years follow the title, "in 2025–26".
   * The session itself is named at the top of the page, so only its years. */
  session?: SessionFilter
  /** For "all": the sessions it spans, for "in 2005–26". */
  sessions?: number[]
  /** A line on what the panel shows or how to use it, right under the
   * title. */
  hint?: React.ReactNode
  /** A short note just after the title, on its line, in the hint's style. */
  titleNote?: React.ReactNode
  /** At the right of the title: a count or a link. */
  aside?: React.ReactNode
  /** Filters (LobbyingFilterBar) at the right of the title and hint, centred
   * on them, wrapping under them where there isn't room. */
  filters?: React.ReactNode
  /** Where the filters start, across the panel's width (a CSS length), to
   * line them up with a column below, as ActivityTable's
   * POSITION_COLUMN_START. Without it, they follow the title. */
  filtersAt?: string
  footer?: React.ReactNode
  style?: React.CSSProperties
}>) {
  const { t } = useTranslation("lobbying")
  const years =
    session === undefined ? undefined : sessionYears(session, sessions)
  const head = (
    // The title with the aside centred on it, and the hint under both.
    <div style={headWrapStyle}>
      <div style={headStyle}>
        <div style={titleRowStyle}>
          <h2 style={titleStyle}>
            {title}
            {years && <> {t("misc.sessionYears", { years })}</>}
          </h2>
          {titleNote && <span style={titleNoteStyle}>{titleNote}</span>}
        </div>
        {aside && <div style={asideStyle}>{aside}</div>}
      </div>
      {hint && <p style={hintStyle}>{hint}</p>}
    </div>
  )
  return (
    <section style={{ ...panelStyle, ...style }}>
      {filters ? (
        <div
          style={
            filtersAt
              ? { ...headWithFiltersStyle, columnGap: 0 }
              : headWithFiltersStyle
          }
        >
          {filtersAt ? (
            <div style={{ flex: `0 0 ${filtersAt}`, minWidth: 0 }}>{head}</div>
          ) : (
            head
          )}
          <div style={filtersSlotStyle}>{filters}</div>
        </div>
      ) : (
        head
      )}
      {children}
      {footer && <div style={footerStyle}>{footer}</div>}
    </section>
  )
}

/** The bar of filters above a list: a session select, a search box, etc.
 * A boxed bar spans the list below it, and a search box styled with
 * listSearchStyle takes the extra room; boxed="fit" fits its filters.
 * boxed="open" is the bar on the page itself, with no box, 1rem over the
 * list below. */
export function LobbyingFilterBar({
  children,
  boxed = false
}: React.PropsWithChildren<{ boxed?: boolean | "fit" | "open" }>) {
  const style = !boxed
    ? filterBarStyle
    : boxed === "open"
    ? { ...filterBarStyle, marginBottom: "1rem" }
    : boxed === "fit"
    ? { ...filterBarStyle, ...boxedStyle, ...fitStyle }
    : { ...filterBarStyle, ...boxedStyle }
  return <div style={style}>{children}</div>
}

/** A visible label for a filter control. */
export function FilterLabel({
  htmlFor,
  children
}: React.PropsWithChildren<{ htmlFor: string }>) {
  return (
    <label htmlFor={htmlFor} style={filterLabelStyle}>
      {children}
    </label>
  )
}

/** A failed load, worded for readers (see lobbyingErrorMessage). */
export function LobbyingLoadError({
  error,
  style
}: {
  error: Error | undefined
  style?: React.CSSProperties
}) {
  const { t } = useTranslation("lobbying")
  return (
    <p style={{ color: MAPLE_COLORS.danger, ...style }}>
      Error: {lobbyingErrorMessage(error, t)}
    </p>
  )
}

/* The selects are the site's (Bootstrap's form-select, selectClass); these
   only size them in the filter bar. */
export const selectStyle: React.CSSProperties = {
  width: "auto"
}

/** The session select stands out from the other filters. */
export const sessionSelectStyle: React.CSSProperties = {
  ...selectStyle,
  // Firefox can size a select too narrow for its bold label (when only
  // short labels like "191st (2019–20)" are offered), so the end of the
  // label slides under the arrow. A floor wider than any session label
  // leaves room.
  minWidth: "14rem"
}

/** Room at the search box's right for its clear button. */
const floatingSearchInputStyle: React.CSSProperties = {
  paddingRight: "2.5rem"
}

/** A filter's search box, as its selects (SessionSelect, PositionSelect):
 * the site's form field with its label floating inside it (Bootstrap's
 * form-floating, as on the organization sign-up), their height and focus.
 * `grow` lets it take the bar's spare room. */
export function FloatingSearch({
  id,
  label,
  value,
  onChange,
  grow = false
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  grow?: boolean
}) {
  const { t } = useTranslation("lobbying")
  return (
    <div
      className={`form-floating ${styles.floatingField}`}
      // The page's 16px, as the sign-up form's, not the filter bar's 14px,
      // which the floating label would take.
      style={{ fontSize: "1rem", minWidth: 240, flex: grow ? 1 : undefined }}
    >
      <input
        type="search"
        id={id}
        // Bootstrap floats the label off the placeholder; it hides the
        // placeholder's own text.
        placeholder={label}
        // A filter, not a form: no list of what was typed here before, which
        // browsers offer for a field with an id.
        autoComplete="off"
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`form-control ${styles.floatingSearchInput}`}
        style={floatingSearchInputStyle}
      />
      <label htmlFor={id}>{label}</label>
      {value && (
        <button
          type="button"
          className={styles.clearSearch}
          aria-label={t("misc.clearSearch")}
          onClick={() => onChange("")}
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      )}
    </div>
  )
}

/** A lobbying select, with selectStyle (or sessionSelectStyle): the site's
 * form-select. */
export const selectClass = "form-select"

/** A filter's floating field's wrapper, with form-floating: its label's
 * grey and its focus (lobbying.module.css). */
export const floatingFieldClass = styles.floatingField

export const searchStyle: React.CSSProperties = {
  minWidth: 240
}

/** A search box that grows to fill a boxed filter bar. */
export const listSearchStyle: React.CSSProperties = {
  ...searchStyle,
  flex: 1
}

const panelStyle: React.CSSProperties = {
  background: MAPLE_COLORS.surfaceBase,
  border: `1px solid ${MAPLE_COLORS.borderSubtle}`,
  // The filters' corners (selectStyle).
  borderRadius: 3,
  boxShadow: "0 0.25rem 1rem rgba(15, 23, 42, 0.06)",
  padding: "1.25rem 1.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.875rem",
  marginBottom: "1.5rem",
  minWidth: 0
}

/** The title row and the hint under it. */
const headWrapStyle: React.CSSProperties = {
  // A little more room under the header than the panel's gap alone.
  marginBottom: "0.25rem"
}

/** The head and the filters side by side, the filters at the right. */
const headWithFiltersStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "0.75rem 1.5rem"
}

/** The filters take the rest of the head's row, so a growing search box
 * (FloatingSearch's grow) fills it; under the head, the panel's width. */
const filtersSlotStyle: React.CSSProperties = {
  flex: "1 1 20rem",
  minWidth: 0
}

const headStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  // What sits at the right, centred down the title.
  alignItems: "center",
  gap: "0.25rem 1rem"
}

/** A Lobbying page's description under its title: the panel hints' light,
 * spaced grey, a size up, as it introduces the page. */
export const pageIntroStyle: React.CSSProperties = {
  color: MAPLE_COLORS.textMuted,
  fontSize: 16,
  fontWeight: 300,
  // 1.5%, as the hints'.
  letterSpacing: "0.015em"
}

/** The title and its note, the note on the title's baseline. */
const titleRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "baseline",
  gap: "0.25rem 0.75rem"
}

/** The hint, close under the title, as its subtitle. */
const hintStyle: React.CSSProperties = {
  margin: "0.25rem 0 0",
  fontSize: 14,
  // A step under the body text's 400.
  fontWeight: 300,
  // 1.5%, as design tools count letter spacing.
  letterSpacing: "0.015em",
  // The muted grey of the column headers, lighter than the body text.
  color: MAPLE_COLORS.textMuted
}

/** A note beside the title: the hint, without its space above. */
const titleNoteStyle: React.CSSProperties = { ...hintStyle, margin: 0 }

/* As the conference committee page's section titles (CardTitle,
   components/conference/styles.ts). Was 14px, uppercase, letter-spaced
   0.06em. */
const titleStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--maple-font-heading)",
  fontSize: "1.25rem",
  fontWeight: 500,
  lineHeight: 1.3,
  color: MAPLE_COLORS.textStrong
}

const asideStyle: React.CSSProperties = {
  fontSize: 13,
  color: MAPLE_COLORS.graySubtleText
}

const footerStyle: React.CSSProperties = {
  borderTop: `1px dashed ${MAPLE_COLORS.borderDefault}`,
  paddingTop: "0.75rem",
  fontSize: 13,
  color: MAPLE_COLORS.graySubtleText
}

const filterBarStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "0.75rem 0.875rem",
  fontSize: 14
}

const boxedStyle: React.CSSProperties = {
  background: MAPLE_COLORS.surfaceBase,
  border: `1px solid ${MAPLE_COLORS.borderSubtle}`,
  borderRadius: 10,
  padding: "0.625rem 1rem",
  marginBottom: "1.5rem"
}

const fitStyle: React.CSSProperties = {
  alignSelf: "flex-start",
  width: "fit-content",
  maxWidth: "100%"
}

const filterLabelStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: MAPLE_COLORS.textMuted
}

// ── Lists and summaries ───────────────────────────────────────────────────────

/** A list table with fixed column widths (set with a <colgroup>), so a
 * re-sort or filter that brings in other rows doesn't resize the columns.
 * Below minWidth it scrolls in its box instead of squeezing the text. */
export const listTableStyle = (minWidth: number): React.CSSProperties => ({
  width: "100%",
  minWidth,
  tableLayout: "fixed",
  borderCollapse: "collapse",
  fontSize: 14,
  color: MAPLE_COLORS.textBody
})

export const listTdStyle: React.CSSProperties = {
  padding: "0.875rem 0.75rem",
  verticalAlign: "top",
  borderTop: `1px solid ${MAPLE_COLORS.borderSubtle}`
}

/** The chevron in a button that shows or hides more: right when closed, down
 * when open, a size under the button's text. */
export function ToggleChevron({ open }: { open: boolean }) {
  return (
    <FontAwesomeIcon
      icon={open ? faChevronDown : faChevronRight}
      aria-hidden
      style={{ fontSize: "0.8em" }}
    />
  )
}

/** The chevron button that shows or hides a row's details. */
export const toggleButtonStyle: React.CSSProperties = {
  flex: "none",
  width: 24,
  height: 24,
  padding: 0,
  border: 0,
  background: "none",
  cursor: "pointer",
  color: MAPLE_COLORS.primary,
  fontSize: 14
}

/** A smaller line under a cell's main text. */
export const subTextStyle: React.CSSProperties = {
  fontSize: 13,
  color: MAPLE_COLORS.graySubtleText
}

/** A summary panel's row of big figures, each with its label and a note. */
export const summaryStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "1.5rem 2.5rem",
  alignItems: "flex-start"
}

export const bigFigureRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "baseline",
  gap: 8,
  fontSize: 14
}

export const bigFigureStyle: React.CSSProperties = {
  fontSize: 40,
  fontWeight: 700,
  lineHeight: 1.1,
  color: MAPLE_COLORS.primary
}

export const summaryNoteStyle: React.CSSProperties = {
  marginTop: 4,
  fontSize: 13,
  lineHeight: 1.45,
  color: MAPLE_COLORS.graySubtleText
}
