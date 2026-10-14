import { Trans, useTranslation } from "next-i18next"
import styled from "styled-components"
import { formatBillId } from "../formatting"
import { maple } from "../links"
import { DottedInternal } from "./styles"
import { ConferenceSummary } from "./types"

const Line = styled.p`
  margin: 0.625rem 0 0;
  font-size: 1.25rem;
  line-height: 1.4;
  color: var(--maple-text-muted);

  @media (min-width: 980px) {
    font-size: 1.5rem;
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
 * What the committee is, in the legislature's own construction: the act it
 * exists to pass, and the two texts it reconciles to pass it. Each number goes
 * to its own bill page.
 */
export function ConferenceByline({
  conference
}: {
  conference: ConferenceSummary
}) {
  const { t } = useTranslation("conferences")
  const bill = (id: string) => (
    <DottedInternal href={maple.bill({ court: conference.court, id })} />
  )
  return (
    <div>
      <Line>
        <Trans
          t={t}
          i18nKey="byline"
          values={{
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
    </div>
  )
}
