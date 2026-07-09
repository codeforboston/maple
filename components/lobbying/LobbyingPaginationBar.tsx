import React from "react"
import { MAPLE_COLORS } from "./chartTheme"

interface Props {
  page: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPage: (p: number) => void
}

export function LobbyingPaginationBar({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPage
}: Props) {
  if (totalPages <= 1) return null
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)

  return (
    <div style={wrapStyle}>
      <span style={{ color: MAPLE_COLORS.textMuted, fontSize: 13 }}>
        {start}–{end} of {totalItems}
      </span>
      <div style={{ display: "flex", gap: "0.25rem" }}>
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          style={btnStyle(page === 1)}
        >
          ← Prev
        </button>
        <span
          style={{
            ...btnStyle(false),
            cursor: "default",
            color: MAPLE_COLORS.textMuted
          }}
        >
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPage(page + 1)}
          disabled={page === totalPages}
          style={btnStyle(page === totalPages)}
        >
          Next →
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
