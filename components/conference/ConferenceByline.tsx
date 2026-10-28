import { Trans, useTranslation } from "next-i18next"
import styled from "styled-components"
import { formatBillId } from "../formatting"
import { maple } from "../links"
import { DottedInternal } from "./styles"
import { ConferenceSummary } from "./types"

/** The mockup's spacing: 24px under the byline before the tabs. A container,
 * so the line steps up with the room the page column has, as the mockup's
 * does, rather than with the window (styles/globals.css, since
 * styled-components 5 cannot write a container query). */
const Wrap = styled.div.attrs({ className: "conference-byline-wrap" })`
  container-type: inline-size;
  padding-bottom: 24px;
`

/** The mockup's byline in Nunito at 20px, and 25px once the column is 800px
 * wide (styles/globals.css), in the site's muted blue-grey. Straight under
 * the title band, whose own 12px is the gap. */
const Line = styled.p.attrs({ className: "conference-byline" })`
  margin: 0;
  font-family: var(--maple-font-body);
  font-size: 1.25rem;
  font-weight: 400;
  line-height: 1.4;
  color: var(--maple-text-muted);
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
    <Wrap>
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
    </Wrap>
  )
}
