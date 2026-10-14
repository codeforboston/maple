import { DateTime } from "luxon"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { maple } from "../links"
import { DottedInternal, Eyebrow } from "./styles"
import { HearingView } from "./types"

const List = styled.ul`
  list-style: none;
  margin: 0.375rem 0 0;
  padding: 0;
  font-size: 0.875rem;
  line-height: 1.6;
`

const Empty = styled.p`
  margin: 0.25rem 0 0;
  font-size: 0.8125rem;
  color: var(--maple-text-muted);
`

/**
 * The public meetings this conference has noticed. A conference deliberates
 * in private, so a noticed meeting is the only thing it does in public. The
 * heading stays when there is nothing under it: that a conference has never
 * met in public is the more interesting fact.
 */
export function ConferenceHearings({ hearings }: { hearings: HearingView[] }) {
  const { t, i18n } = useTranslation("conferences")
  const now = Date.now()
  return (
    <div>
      <Eyebrow>{t("hearings")}</Eyebrow>
      {hearings.length === 0 && <Empty>{t("no_hearings")}</Empty>}
      <List>
        {hearings.map(h => (
          <li key={h.id}>
            <DottedInternal href={maple.hearing(h)}>
              {t(h.startsAt <= now ? "hearing_held" : "hearing_scheduled", {
                date: DateTime.fromMillis(h.startsAt)
                  .setLocale(i18n.language)
                  .toLocaleString(DateTime.DATE_FULL)
              })}
            </DottedInternal>
          </li>
        ))}
      </List>
    </div>
  )
}
