import React from "react"
import { useTranslation } from "next-i18next"
import { MAPLE_COLORS } from "./chartTheme"
import { lobbyingErrorMessage } from "./errorMessage"

/**
 * The white card each Lobbying Explorer section sits in: an uppercase title,
 * an optional line beside it (a count or a hint), the content, and an
 * optional footer under a dashed rule.
 */
export function LobbyingPanel({
  title,
  aside,
  footer,
  children,
  style
}: React.PropsWithChildren<{
  title: React.ReactNode
  aside?: React.ReactNode
  footer?: React.ReactNode
  style?: React.CSSProperties
}>) {
  return (
    <section style={{ ...panelStyle, ...style }}>
      <div style={headStyle}>
        <h2 style={titleStyle}>{title}</h2>
        {aside && <div style={asideStyle}>{aside}</div>}
      </div>
      {children}
      {footer && <div style={footerStyle}>{footer}</div>}
    </section>
  )
}

/** The bar of filters above a list: a session select, a search box, etc. */
export function LobbyingFilterBar({
  children,
  boxed = false
}: React.PropsWithChildren<{ boxed?: boolean }>) {
  return (
    <div style={boxed ? { ...filterBarStyle, ...boxedStyle } : filterBarStyle}>
      {children}
    </div>
  )
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

export const selectStyle: React.CSSProperties = {
  padding: "0.45rem 0.75rem",
  minHeight: 44,
  border: `1px solid ${MAPLE_COLORS.borderDefault}`,
  borderRadius: 8,
  fontSize: 15,
  color: MAPLE_COLORS.textStrong,
  background: MAPLE_COLORS.surfaceBase,
  cursor: "pointer"
}

/** The session select stands out from the other filters. */
export const sessionSelectStyle: React.CSSProperties = {
  ...selectStyle,
  // Firefox can size a select too narrow for its bold label (when only
  // short labels like "191st (2019–20)" are offered), so the end of the
  // label slides under the arrow. A floor wider than any session label
  // leaves room.
  minWidth: "12rem",
  fontWeight: 700,
  background: MAPLE_COLORS.blueSubtleBg,
  borderColor: MAPLE_COLORS.primary
}

export const searchStyle: React.CSSProperties = {
  ...selectStyle,
  minWidth: 240,
  cursor: "text"
}

const panelStyle: React.CSSProperties = {
  background: MAPLE_COLORS.surfaceBase,
  border: `1px solid ${MAPLE_COLORS.borderSubtle}`,
  borderRadius: 10,
  boxShadow: "0 0.25rem 1rem rgba(15, 23, 42, 0.06)",
  padding: "1.25rem 1.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.875rem",
  marginBottom: "1.5rem",
  minWidth: 0
}

const headStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  alignItems: "baseline",
  gap: "0.25rem 1rem"
}

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
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
  alignSelf: "flex-start",
  width: "fit-content",
  maxWidth: "100%",
  background: MAPLE_COLORS.surfaceBase,
  border: `1px solid ${MAPLE_COLORS.borderSubtle}`,
  borderRadius: 10,
  padding: "0.625rem 1rem",
  marginBottom: "1.5rem"
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
