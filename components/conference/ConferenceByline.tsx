import { faCircleInfo } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Trans, useTranslation } from "next-i18next"
import styled from "styled-components"
import { formatBillId } from "../formatting"
import { maple } from "../links"
import { DottedInternal, Notice } from "./styles"
import { ConferenceSummary } from "./types"

/** The mockup's spacing: 24px under the byline before the tabs. */
const Wrap = styled.div`
  padding-bottom: 24px;
`

/** The byline in Nunito at 18px, 20px on mobile, in the site's muted
 * blue-grey: a description under the title rather than a second one (the
 * mockup's 20px and 25px). Straight under the title band, whose own 12px is
 * the gap. */
const Line = styled.p`
  margin: 0;
  /* A readable measure, about 70 characters, rather than the column's whole
     width. */
  max-width: 70ch;
  font-family: var(--maple-font-body);
  font-size: 1.125rem;
  font-weight: 400;
  line-height: 1.4;
  color: var(--maple-text-muted);

  /* A step larger on mobile, under the larger title there. */
  @media (max-width: 767.98px) {
    font-size: 1.25rem;
  }
`

/** The trial note in the site's soft blue rather than the orange note's
 * (Notice): a status of this conference rather than a warning. An info icon
 * leads it, the words wrapping clear of it. */
const BlueNotice = styled(Notice)`
  && {
    display: flex;
    align-items: baseline;
    gap: 0.625rem;
    background: var(--maple-color-blue-subtle-bg);
    border-color: var(--maple-color-blue-subtle-border);
    color: var(--maple-color-blue-subtle-text);
  }
`

const Status = styled.span`
  display: inline-block;
  margin-top: 0.75rem;
  padding: 0.125rem 0.625rem;
  border-radius: var(--maple-radius-pill);
  background: var(--maple-color-gray-subtle-bg);
  border: 1px solid var(--maple-color-gray-subtle-border);
  color: var(--maple-color-gray-subtle-text);
  font-size: 0.75rem;
  font-weight: 600;
`

/**
 * Who the committee is and what it is doing: how many members each chamber
 * appointed, the two texts they are reconciling, and the act. While it sits,
 * what happens to its report; once it no longer sits, only that they were
 * appointed, the status saying the rest. Each number goes to its own bill
 * page. Under it, the report that resolved it, and a notice where we haven't
 * covered it.
 */
export function ConferenceByline({
  conference
}: {
  conference: ConferenceSummary
}) {
  const { t } = useTranslation("conferences")
  // Spelled out ("three"), digits past ten.
  const number = (n: number) => t(`number.${n}`, { defaultValue: `${n}` })
  const { senate, house } = conference.confereeCounts
  const senators = t("byline_senators", {
    count: senate,
    number: number(senate)
  })
  const bill = (id: string) => (
    <DottedInternal href={maple.bill({ court: conference.court, id })} />
  )
  return (
    <Wrap>
      <Line>
        <Trans
          t={t}
          i18nKey={
            conference.status === "appointed" ? "byline" : "byline_closed"
          }
          values={{
            // The sentence starts with it.
            senators: senators.charAt(0).toUpperCase() + senators.slice(1),
            representatives: t("byline_representatives", {
              count: house,
              number: number(house)
            }),
            title: conference.title.trim(),
            senate: formatBillId(conference.senateBillId),
            house: formatBillId(conference.houseBillId)
          }}
          components={{
            1: <em />,
            3: bill(conference.senateBillId),
            5: bill(conference.houseBillId)
          }}
        />
      </Line>
      {conference.status !== "appointed" && (
        <Status>{t(`status.${conference.status}`)}</Status>
      )}
      {conference.reportBillId && (
        <Notice>
          <Trans
            t={t}
            i18nKey="notice.resolved"
            values={{ report: formatBillId(conference.reportBillId) }}
            components={{ 1: bill(conference.reportBillId) }}
          />
        </Notice>
      )}
      {!conference.covered && (
        <BlueNotice>
          <FontAwesomeIcon icon={faCircleInfo} aria-hidden />
          <span>{t("notice.not_covered")}</span>
        </BlueNotice>
      )}
    </Wrap>
  )
}
