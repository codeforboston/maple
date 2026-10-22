import React, { useId, useState } from "react"
import { useTranslation, type TFunction } from "next-i18next"
import type { Activity, ActivityFiler, ActivityRow } from "./activity"
import { MAPLE_COLORS } from "./chartTheme"
import { LobbyingPaginationBar } from "./LobbyingPaginationBar"
import { LobbyingPositionChip } from "./LobbyingPositionChip"
import { thStyle } from "./SortTh"
import { SosSourceLink } from "./SosSourceLink"
import { usePagination } from "./usePagination"

// Name in-house lobbyists in the "who lobbied" line when there are at most
// this many.
const MAX_NAMED_IN_HOUSE = 3

/**
 * One row per organization (on a bill's page) or per bill (on a client's
 * page). Expanding a row lists its filers with the position each reported per
 * period and links to their filings.
 */
export function ActivityTable({
  by,
  data,
  rowHref,
  pageSize = 25
}: {
  by: "client" | "bill"
  data: Activity
  rowHref?: (row: ActivityRow) => string
  pageSize?: number
}) {
  const { t } = useTranslation("lobbying")
  const idPrefix = useId()
  const [open, setOpen] = useState<Set<string>>(new Set())
  const { page, setPage, pageItems, totalPages, totalItems } = usePagination(
    data.rows,
    pageSize
  )

  const toggle = (key: string) =>
    setOpen(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const whoText = ({ who }: ActivityRow) => {
    const parts: string[] = []
    if (who.inHouse.length) {
      const text = t("activity.whoInHouse", { count: who.inHouse.length })
      parts.push(
        who.inHouse.length <= MAX_NAMED_IN_HOUSE
          ? t("activity.whoNames", { text, names: who.inHouse.join(", ") })
          : text
      )
    }
    for (const firm of who.firms)
      parts.push(
        firm.agents
          ? t("activity.whoFirmAgents", { name: firm.name, count: firm.agents })
          : firm.name
      )
    return parts.join(" · ") || "—"
  }

  return (
    <div>
      <div
        style={{
          overflowX: "auto",
          border: `1px solid ${MAPLE_COLORS.borderSubtle}`,
          borderRadius: 8
        }}
      >
        <table
          style={{ width: "100%", minWidth: 720, borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th style={thStyle}>
                {t(by === "bill" ? "fields.bill" : "activity.column.client")}
              </th>
              <th style={thStyle}>{t("activity.column.latestPosition")}</th>
              <th style={thStyle}>{t("activity.column.whoLobbied")}</th>
              <th style={thStyle}>{t("fields.filings")}</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((row, i) => {
              const isOpen = open.has(row.key)
              // Row keys can hold spaces, which an id can't.
              const panelId = `${idPrefix}-${(page - 1) * pageSize + i}`
              return (
                <React.Fragment key={row.key}>
                  <tr
                    style={{
                      background: isOpen
                        ? MAPLE_COLORS.blueSubtleBg
                        : MAPLE_COLORS.surfaceBase
                    }}
                  >
                    <td style={cellStyle}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                          aria-label={t(
                            isOpen
                              ? "activity.hideFilers"
                              : "activity.showFilers",
                            { name: row.label }
                          )}
                          onClick={() => toggle(row.key)}
                          style={toggleStyle}
                        >
                          {isOpen ? "▾" : "▸"}
                        </button>
                        <div>
                          {rowHref ? (
                            <a
                              href={rowHref(row)}
                              style={{
                                fontWeight: 700,
                                color: MAPLE_COLORS.primary
                              }}
                            >
                              {row.label}
                            </a>
                          ) : (
                            <span style={{ fontWeight: 700 }}>{row.label}</span>
                          )}
                          {row.title && (
                            <div
                              style={{
                                fontSize: 13,
                                color: MAPLE_COLORS.textBody
                              }}
                            >
                              {row.title}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={cellStyle}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: 4
                        }}
                      >
                        {row.latest.positions.map(p => (
                          <LobbyingPositionChip
                            key={p}
                            position={p}
                            title={t("activity.latestPeriod", {
                              period: row.latest.period.label
                            })}
                          />
                        ))}
                      </div>
                    </td>
                    <td style={{ ...cellStyle, fontSize: 13 }}>
                      {whoText(row)}
                    </td>
                    <td style={{ ...cellStyle, fontSize: 13 }}>
                      {t("activity.filings", { count: row.filings })}
                    </td>
                  </tr>
                  {isOpen && (
                    <tr id={panelId}>
                      <td
                        colSpan={4}
                        style={{
                          padding: "0 0.75rem 0.75rem",
                          background: MAPLE_COLORS.blueSubtleBg
                        }}
                      >
                        <FilerList row={row} data={data} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
      <LobbyingPaginationBar
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPage={setPage}
      />
    </div>
  )
}

function FilerList({ row, data }: { row: ActivityRow; data: Activity }) {
  const { t } = useTranslation("lobbying")
  // The row's own periods, newest first, so each filer's history lines up.
  const periods = data.periods.filter(p =>
    row.filers.some(f => f.byPeriod[p.key])
  )
  return (
    <div
      style={{
        background: MAPLE_COLORS.surfaceMuted,
        border: `1px solid ${MAPLE_COLORS.blueBorder}`,
        borderRadius: 8
      }}
    >
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {row.filers.map((filer, i) => (
          <li
            key={filer.entityNameNorm}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem 1.5rem",
              padding: "0.75rem 1rem",
              borderTop:
                i > 0 ? `1px solid ${MAPLE_COLORS.borderSubtle}` : undefined
            }}
          >
            <div
              style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 1rem" }}
            >
              {periods.map(p => (
                <div
                  key={p.key}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 4
                  }}
                >
                  <span style={periodCaptionStyle}>{p.label}</span>
                  {filer.byPeriod[p.key] ? (
                    filer.byPeriod[p.key].positions.map(pos => (
                      <LobbyingPositionChip key={pos} position={pos} />
                    ))
                  ) : (
                    <span
                      title={t("activity.noFiling")}
                      style={{ color: MAPLE_COLORS.textMuted }}
                    >
                      —
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.4 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>
                {filer.entityName}
              </div>
              <div style={{ color: MAPLE_COLORS.graySubtleText, fontSize: 12 }}>
                {filerKind(filer, t)}
              </div>
              <div
                style={{ display: "flex", flexWrap: "wrap", gap: "2px 14px" }}
              >
                {periods.flatMap(p =>
                  (filer.byPeriod[p.key]?.disclosureUrls ?? []).map(url => (
                    <SosSourceLink
                      key={url}
                      href={url}
                      label={t("activity.filingLink", { period: p.label })}
                      style={{ fontSize: 12, fontWeight: 700 }}
                    />
                  ))
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p
        style={{
          margin: 0,
          padding: "0 1rem 0.75rem",
          fontSize: 12,
          color: MAPLE_COLORS.graySubtleText
        }}
      >
        {t("activity.positionsNote")}
      </p>
    </div>
  )
}

function filerKind(filer: ActivityFiler, t: TFunction) {
  if (filer.inHouse) return t("activity.inHouse")
  if (filer.agents.length)
    return t("activity.firmAgents", { names: filer.agents.join(", ") })
  return t("activity.firm")
}

const cellStyle: React.CSSProperties = {
  padding: "0.75rem",
  verticalAlign: "top",
  borderTop: `1px solid ${MAPLE_COLORS.borderSubtle}`,
  color: MAPLE_COLORS.textBody,
  fontSize: 14
}

const toggleStyle: React.CSSProperties = {
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

const periodCaptionStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.04em",
  color: MAPLE_COLORS.textMuted,
  whiteSpace: "nowrap"
}
