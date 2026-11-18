import { DateTime } from "luxon"
import { Trans, useTranslation } from "next-i18next"
import { useId, useState } from "react"
import styled from "styled-components"
import { FEEDBACK_URL } from "../common"
import { formatBillId } from "../formatting"
import { brand, ink, line } from "./input/tokens"
import { ConferenceSummary } from "./types"

/** The panel's parts, in order, each a lead-in and a paragraph under
 * analysis.about in conferences.json. Edit the wording there; add a part (a
 * "Reviewed by" line, say) by adding its key here and its text there. */
export const ABOUT_THIS_ANALYSIS = [
  "read",
  "written",
  "labels",
  "isnt",
  "corrections",
  "beta"
] as const

const Feedback = styled.a`
  font-weight: 600;
  color: var(--maple-brand-primary);
  text-decoration: underline dotted;
  text-underline-offset: 4px;
  &:hover {
    color: ${brand.fill};
  }
`

/** The feedback link's look, on a button: it opens the panel in place. */
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

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 90ch;
  margin-top: 12px;
  padding: 12px 16px;
  border: 1px solid ${line.default};
  border-radius: 8px;

  /* Its display would otherwise outrank the hidden attribute. */
  &[hidden] {
    display: none;
  }
  && p {
    margin: 0;
    font-size: 0.8125rem;
    line-height: 1.6;
    color: ${ink.mid};
  }
  strong {
    color: ${ink.strong};
  }
`

/** "2026-11-18" as "November 18, 2026", or null where it isn't a date. */
const formatDate = (iso: string | null) => {
  if (!iso) return null
  const d = DateTime.fromISO(iso)
  return d.isValid ? d.toLocaleString(DateTime.DATE_FULL) : null
}

/**
 * Where the overview and its open questions come from: one line under the
 * overview, naming the two texts compared and when the analysis was last
 * checked, with the feedback link and a button that opens what the analysis
 * is and isn't in place.
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
    <>
      <p>
        <Trans
          t={t}
          i18nKey={date ? "analysis.line" : "analysis.line_undated"}
          values={{
            senate: formatBillId(conference.senateBillId),
            house: formatBillId(conference.houseBillId),
            date
          }}
          components={[
            <Feedback
              key="feedback"
              href={FEEDBACK_URL}
              target="_blank"
              rel="noopener noreferrer"
            />,
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
      <Panel id={panel} hidden={!open}>
        {ABOUT_THIS_ANALYSIS.map(part => (
          <p key={part}>
            <strong>{t(`analysis.about.${part}.title`)}</strong>{" "}
            {t(`analysis.about.${part}.body`)}
          </p>
        ))}
      </Panel>
    </>
  )
}
