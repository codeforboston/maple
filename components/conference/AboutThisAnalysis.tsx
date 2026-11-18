import { faCircleInfo } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { DateTime } from "luxon"
import { Trans, useTranslation } from "next-i18next"
import { useId, useState } from "react"
import styled from "styled-components"
import { formatBillId } from "../formatting"
import { FEEDBACK_EMAIL } from "../shared/CopyEmail"
import { brand, ink, line, wash } from "./input/tokens"
import { ConferenceSummary } from "./types"

/** The panel's parts, in order, each a lead-in and a paragraph under
 * analysis.about in conferences.json. Edit the wording there; add a part (a
 * "Reviewed by" line, say) by adding its key here and its text there. */
export const ABOUT_THIS_ANALYSIS = [
  "beta",
  "read",
  "written",
  "labels",
  "isnt",
  "corrections"
] as const

/** A note on the whole section, set apart from what it covers: a soft grey
 * box across the card, with an info mark, in a grey dark enough to read. */
const Box = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
  border: 1px solid ${line.default};
  border-radius: 8px;
  background: ${wash.default};
  font-size: 0.8125rem;
  line-height: 1.6;
  color: ${ink.midheavy};

  p {
    margin: 0;
  }
`

const Line = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
`

const Mark = styled(FontAwesomeIcon)`
  flex-shrink: 0;
`

const Link = styled.a`
  font-weight: 600;
  color: var(--maple-brand-primary);
  text-decoration: underline dotted;
  text-underline-offset: 4px;
  &:hover {
    color: ${brand.fill};
  }
`

/** The link's look, on a button: it opens the panel in place. */
const Toggle = styled.button`
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  font-weight: 600;
  color: var(--maple-brand-primary);
  text-decoration: underline dotted;
  text-underline-offset: 4px;
  &:hover {
    color: ${brand.fill};
  }
`

/** Under the line, indented to its words, cut off from it by a rule. */
const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 90ch;
  margin-left: calc(1em + 10px);
  padding-top: 10px;
  border-top: 1px solid ${line.default};

  /* Its display would otherwise outrank the hidden attribute. */
  &[hidden] {
    display: none;
  }
  strong {
    color: ${ink.strong};
  }
`

const Updated = styled.p`
  && {
    padding-top: 4px;
    font-size: 0.75rem;
  }
`

/** "2026-11-18" as "November 18, 2026", or null where it isn't a date. */
const formatDate = (iso: string | null) => {
  if (!iso) return null
  const d = DateTime.fromISO(iso)
  return d.isValid ? d.toLocaleString(DateTime.DATE_FULL) : null
}

/**
 * Where the section's analysis comes from, at its top, covering all of it:
 * the overview, the open questions and where the texts match. One line names
 * the two texts compared, with a button that opens what the analysis is and
 * isn't in place, ending with when it was last checked.
 */
export function AnalysisDisclosure({
  conference
}: {
  conference: Pick<
    ConferenceSummary,
    "senateBillId" | "houseBillId" | "analysisUpdatedAt"
  >
}) {
  const { t } = useTranslation("conferences")
  const [open, setOpen] = useState(false)
  const panel = useId()
  const date = formatDate(conference.analysisUpdatedAt)
  return (
    <Box>
      <Line>
        <Mark icon={faCircleInfo} aria-hidden />
        <p>
          <Trans
            t={t}
            i18nKey="analysis.line"
            values={{
              senate: formatBillId(conference.senateBillId),
              house: formatBillId(conference.houseBillId)
            }}
            components={[
              <Toggle
                key="about"
                type="button"
                aria-expanded={open}
                aria-controls={panel}
                onClick={() => setOpen(o => !o)}
              />
            ]}
          />
        </p>
      </Line>
      <Panel id={panel} hidden={!open}>
        {ABOUT_THIS_ANALYSIS.map(part => (
          <p key={part}>
            <strong>{t(`analysis.about.${part}.title`)}</strong>{" "}
            <Trans
              t={t}
              i18nKey={`analysis.about.${part}.body`}
              values={{ email: FEEDBACK_EMAIL }}
              components={[
                <Link key="email" href={`mailto:${FEEDBACK_EMAIL}`} />
              ]}
            />
          </p>
        ))}
        {date && <Updated>{t("analysis.updated", { date })}</Updated>}
      </Panel>
    </Box>
  )
}
