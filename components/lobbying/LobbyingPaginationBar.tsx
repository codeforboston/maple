import React, { useEffect, useState } from "react"
import { useTranslation } from "next-i18next"
import { MAPLE_COLORS } from "./chartTheme"

interface Props {
  page: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPage: (p: number) => void
  itemLabel?: string
}

export function LobbyingPaginationBar({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPage,
  itemLabel
}: Props) {
  const { t } = useTranslation("lobbying")
  const [pageInput, setPageInput] = useState(String(page))

  // Keep the typed value in sync when the page changes externally (Prev/
  // Next, or a filter change resetting to page 1) — but not while the user
  // is actively typing a replacement value.
  useEffect(() => {
    setPageInput(String(page))
  }, [page])

  if (totalPages <= 1) return null
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)

  function commitPageInput() {
    const parsed = parseInt(pageInput, 10)
    if (Number.isNaN(parsed)) {
      setPageInput(String(page))
      return
    }
    const clamped = Math.min(Math.max(parsed, 1), totalPages)
    setPageInput(String(clamped))
    if (clamped !== page) onPage(clamped)
  }

  return (
    <div style={wrapStyle}>
      <span style={{ color: MAPLE_COLORS.textMuted, fontSize: 13 }}>
        {start}–{end} of {totalItems}
        {itemLabel ? ` ${itemLabel}` : ""}
      </span>
      <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          style={btnStyle(page === 1)}
        >
          {t("pagination.prev")}
        </button>
        <span style={pageJumpStyle}>
          <input
            type="text"
            inputMode="numeric"
            value={pageInput}
            onChange={e => setPageInput(e.target.value.replace(/[^0-9]/g, ""))}
            onBlur={commitPageInput}
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.currentTarget.blur()
              }
            }}
            aria-label={t("pagination.pageNumber")}
            style={pageInputStyle}
          />
          <span style={{ color: MAPLE_COLORS.textMuted }}> / {totalPages}</span>
        </span>
        <button
          onClick={() => onPage(page + 1)}
          disabled={page === totalPages}
          style={btnStyle(page === totalPages)}
        >
          {t("pagination.next")}
        </button>
      </div>
    </div>
  )
}

const wrapStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0.75rem 0 0.25rem",
  flexWrap: "wrap",
  gap: "0.5rem"
}

const btnStyle = (disabled: boolean): React.CSSProperties => ({
  padding: "0.3rem 0.7rem",
  border: `1px solid ${MAPLE_COLORS.borderDefault}`,
  borderRadius: 4,
  background: MAPLE_COLORS.surfaceBase,
  color: disabled ? MAPLE_COLORS.textMuted : MAPLE_COLORS.textBody,
  fontSize: 13,
  cursor: disabled ? "default" : "pointer",
  opacity: disabled ? 0.5 : 1
})

// Deliberately not button-shaped (no border/background) — this is an
// editable field, not a static label, so it shouldn't visually compete with
// the actual Prev/Next buttons on either side.
const pageJumpStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  fontSize: 13,
  padding: "0.3rem 0.35rem"
}

const pageInputStyle: React.CSSProperties = {
  width: "2.2rem",
  textAlign: "center",
  border: "none",
  borderBottom: `1px solid ${MAPLE_COLORS.borderDefault}`,
  background: "transparent",
  color: MAPLE_COLORS.textBody,
  fontSize: 13,
  padding: "0.1rem 0.2rem"
}
