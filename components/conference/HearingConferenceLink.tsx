import { Trans, useTranslation } from "next-i18next"
import { Internal, maple } from "../links"
import { ConferenceSummary, conferenceName } from "./types"

/**
 * Under a hearing's title, naming the conference that linked it. Conference
 * hearings carry no bill numbers of their own, so this is the only way from
 * the hearing back to its bills.
 */
export function HearingConferenceLink({
  conference
}: {
  conference: ConferenceSummary | null | undefined
}) {
  const { t } = useTranslation("conferences")
  if (!conference) return null
  return (
    <p className="mb-3">
      <Trans
        t={t}
        i18nKey="hearing_backlink"
        values={{ name: conferenceName(conference) }}
        components={{
          1: <Internal href={maple.conference(conference)} />
        }}
      />
    </p>
  )
}
