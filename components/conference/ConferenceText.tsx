import { useState } from "react"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { useMediaQuery } from "usehooks-ts"
import { Form, Spinner } from "../bootstrap"
import { useBill } from "../db/bills"
import { billPdfUrl, External } from "../links"
import { ink, sunken } from "./input/tokens"
import { CardTitle } from "./styles"
import { ConferenceSummary } from "./types"

const SIDES = ["senate", "house", "both"] as const
type Side = (typeof SIDES)[number]
type Chamber = Exclude<Side, "both">

const Picker = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.625rem;

  label {
    margin: 0;
    font-weight: 600;
    font-size: 0.875rem;
  }
  select {
    width: auto;
    font-size: 0.875rem;
  }
`

/** The recessed tray the sheets sit in, the height the mockup gives it. */
const Well = styled.div`
  display: flex;
  gap: 1rem;
  height: min(74vh, 860px);
  margin-top: 1rem;
  padding: 1.25rem;
  background: ${sunken};
  border: 1px solid var(--maple-surface-border);
  border-radius: var(--maple-radius-xl);

  @media (min-width: 576px) {
    padding: 1.75rem;
  }
`

/** One document, which scrolls on its own so a section of one text can be
 * held against the same section of the other. */
const Paper = styled.article`
  flex: 1 1 0;
  min-width: 0;
  max-width: 680px;
  margin: 0 auto;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 2.125rem 1.75rem;
  background: var(--maple-surface-base);
  border-radius: 3px;
  box-shadow: var(--maple-shadow-md);

  @media (min-width: 576px) {
    padding: 2.75rem 3.25rem;
  }
`

/* The sheet set as the mockup sets it: the title alone in Lexend, the
   chamber and number above it and the text below in Nunito. */

/** Which chamber's text this is, and its number. */
const SheetLabel = styled.p`
  margin: 0;
  font-family: var(--maple-font-body);
  font-weight: 600;
  font-size: 0.8125rem;
  color: ${ink.mid};
`

const SheetTitle = styled.h3`
  margin: 2px 0 24px;
  font-family: var(--maple-font-heading);
  font-weight: 500;
  font-size: 1rem;
  line-height: 1.3;
  color: ${ink.strong};
`

const Line = styled.p`
  margin: 0 0 0.75rem;
  font-family: var(--maple-font-body);
  font-size: 0.8125rem;
  line-height: 1.75;
  color: ${ink.strong};
  white-space: pre-wrap;
  overflow-wrap: break-word;

  &:last-child {
    margin-bottom: 0;
  }
`

/** Where a sheet has nothing to show: a spinner or a sentence, centred. */
const Empty = styled.div`
  flex: 1 1 0;
  min-width: 0;
  margin: auto;
  max-width: 20rem;
  text-align: center;
  font-size: 0.875rem;
  line-height: 1.7;
  /* Body ink rather than muted: on the well's grey (sunken) the muted grey
     falls short of AA contrast. */
  color: var(--maple-text-body);
`

function Sheet({
  court,
  billId,
  chamber,
  fetched: { loading, result: bill }
}: {
  court: number
  billId: string
  chamber: Chamber
  fetched: ReturnType<typeof useBill>
}) {
  const { t } = useTranslation("conferences")
  const content = bill?.content
  const text = content?.DocumentText
  const name = t(chamber)

  if (loading)
    return (
      <Empty>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">{t("text_loading")}</span>
        </Spinner>
      </Empty>
    )

  // Not scraped yet, or the legislature's PDF gave the scraper nothing.
  if (!text?.trim())
    return (
      <Empty>
        {t("text_missing", { bill: billId })}{" "}
        <External href={billPdfUrl(court, billId)}>{t("text_pdf")}</External>
      </Empty>
    )

  // One paragraph per line the legislature broke: its line breaks are the
  // only structure a bill has.
  return (
    <Paper aria-label={`${name} ${billId}`}>
      <SheetLabel>
        {name} – {billId}
      </SheetLabel>
      <SheetTitle>{content?.Title}</SheetTitle>
      {text
        .split(/\r?\n/)
        .filter(line => line.trim())
        .map((line, i) => (
          <Line key={i}>{line}</Line>
        ))}
    </Paper>
  )
}

/**
 * The two texts the conference is reconciling, side by side, or one chamber's
 * at a time. Fetched in the browser rather than with the page: an omnibus
 * pair is half a megabyte. Both are fetched here, once, so switching version
 * does not fetch a text again.
 */
export function ConferenceText({
  conference
}: {
  conference: ConferenceSummary
}) {
  const { t } = useTranslation("conferences")
  const narrow = useMediaQuery("(max-width: 767.98px)")
  const [picked, pick] = useState<Side | null>(null)
  const side = picked ?? (narrow ? "senate" : "both")

  const { court, senateBillId, houseBillId } = conference
  const senate = useBill(court, senateBillId)
  const house = useBill(court, houseBillId)
  const sheets = [
    { chamber: "senate", billId: senateBillId, fetched: senate },
    { chamber: "house", billId: houseBillId, fetched: house }
  ] as const

  // On the page itself rather than in a white card, as the mockup sets it: the
  // well is the frame.
  return (
    <section>
      <CardTitle>{t("bill_text")}</CardTitle>
      <Picker>
        <Form.Label htmlFor="conference-text-version">
          {t("version")}
        </Form.Label>
        <Form.Select
          id="conference-text-version"
          value={side}
          onChange={e => pick(e.target.value as Side)}
        >
          {SIDES.map(s => (
            <option key={s} value={s}>
              {t(`version_${s}`)}
            </option>
          ))}
        </Form.Select>
      </Picker>
      <Well>
        {sheets
          .filter(s => side === "both" || side === s.chamber)
          .map(s => (
            <Sheet key={s.chamber} court={court} {...s} />
          ))}
      </Well>
    </section>
  )
}
