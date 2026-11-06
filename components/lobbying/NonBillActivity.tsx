import React from "react"
import { useTranslation } from "next-i18next"
import type { LobbyingFiling } from "functions/src/lobbying/types"
import { MAPLE_COLORS } from "./chartTheme"

/** A filing with no bill, such as an Executive item: what it is, the agency
 * when the portal names one, and its title unless a column already shows it. */
export function NonBillActivity({
  filing,
  showTitle
}: {
  filing: LobbyingFiling
  showTitle: boolean
}) {
  const { t } = useTranslation("lobbying")
  const chamber =
    filing.chamber === "Executive"
      ? t("activity.chamberExecutive")
      : t("activity.chamberOther")
  // The portal's identifier cell reads "Other" on some Executive items,
  // which names no agency.
  const agency =
    filing.agency && filing.agency !== "Other" ? filing.agency : null
  return (
    <>
      <span style={{ color: MAPLE_COLORS.textBody }}>
        {agency ? t("activity.chamberAgency", { chamber, agency }) : chamber}
      </span>
      {showTitle && filing.activityTitle && (
        <div style={titleStyle} title={filing.activityTitle}>
          {filing.activityTitle}
        </div>
      )}
    </>
  )
}

const titleStyle: React.CSSProperties = {
  color: MAPLE_COLORS.textMuted,
  fontSize: 12,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  maxWidth: "28rem"
}
