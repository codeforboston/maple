import { useTranslation } from "next-i18next"
import styled from "styled-components"
import type { ConferenceOutcome } from "../../functions/src/conferences/types"
import { ink, line, outcomeInk, wash } from "./input/tokens"
import { Card, CardTitle } from "./styles"
import { DifferenceView } from "./types"

/** The mockup's order: one chamber's text, then words neither passed, then
 * what was left out. */
export const OUTCOMES = [
  "senate",
  "house",
  "combined",
  "modified",
  "new",
  "dropped"
] as const satisfies readonly ConferenceOutcome[]

/** An outcome to show, or every question. */
export type OutcomeFilter = ConferenceOutcome | "all"

export function countOutcomes(differences: DifferenceView[]) {
  const counts = Object.fromEntries(OUTCOMES.map(o => [o, 0])) as Record<
    ConferenceOutcome,
    number
  >
  for (const d of differences) if (d.outcome) counts[d.outcome]++
  return counts
}

/** A label on an outcome's tint, or on a wash where there is none. As a
 * button it filters, outlined while pressed. */
export const Chip = styled.span<{ $o?: ConferenceOutcome }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1.3;
  white-space: nowrap;
  color: ${({ $o }) => ($o ? outcomeInk[$o].fill : ink.strong)};
  background: ${({ $o }) => ($o ? outcomeInk[$o].tint : wash.default)};

  &[aria-pressed] {
    cursor: pointer;
  }
  &[aria-pressed="true"] {
    border-color: currentColor;
  }
`

export const ChipCount = styled.span`
  font-variant-numeric: tabular-nums;
  opacity: 0.85;
`

/** Small wording changes that leave the outcome standing. */
export const EditedMark = styled.span`
  padding: 2px 9px;
  border: 1px dashed ${ink.muted};
  border-radius: 999px;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1.4;
  white-space: nowrap;
  color: ${ink.mid};
`

/** An outcome's chip, with its count where one is given; a filter given an
 * onClick. */
export function OutcomeChip({
  o,
  count,
  pressed,
  onClick
}: {
  o: ConferenceOutcome
  count?: number
  pressed?: boolean
  onClick?: () => void
}) {
  const { t } = useTranslation("conferences")
  const label = t(`resolved.outcome.${o}`)
  const body =
    count === undefined ? (
      label
    ) : (
      <>
        {label} <ChipCount>{count}</ChipCount>
      </>
    )
  return onClick ? (
    <Chip
      as="button"
      type="button"
      $o={o}
      aria-pressed={pressed}
      onClick={onClick}
    >
      {body}
    </Chip>
  ) : (
    <Chip $o={o}>{body}</Chip>
  )
}

const Frame = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: 18px;
`

const Head = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  align-items: baseline;
  justify-content: space-between;

  h2 {
    margin: 0;
  }
  p {
    margin: 0;
    font-size: 0.875rem;
    color: ${ink.mid};
  }
`

const Bar = styled.div`
  display: flex;
  gap: 2px;
  height: 34px;
  overflow: hidden;
  border-radius: 10px;
  background: ${line.default};
`

const Segment = styled.button<{ $o: ConferenceOutcome; $n: number }>`
  flex: ${({ $n }) => $n};
  display: grid;
  place-items: center;
  min-width: 0;
  overflow: hidden;
  padding: 0;
  border: 0;
  font-size: 0.8125rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--maple-surface-base);
  background: ${({ $o }) => outcomeInk[$o].fill};

  &[aria-pressed="true"] {
    box-shadow: inset 0 0 0 3px ${ink.strong};
  }
`

const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const KeyToggle = styled.details`
  summary {
    width: fit-content;
    cursor: pointer;
    font-size: 0.84375rem;
    font-weight: 700;
    color: var(--maple-brand-primary);
  }
`

const Key = styled.dl`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px 20px;
  margin: 12px 0 0;
  padding-top: 16px;
  border-top: 1px solid ${line.default};

  div {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  dd {
    margin: 0;
    font-size: 0.875rem;
    color: ${ink.mid};
  }
`

/**
 * How the conference resolved each open question, counted: a bar whose
 * segments filter the questions below, the counts as chips, and what each
 * label means. Counted on the page, never stored.
 */
export function ConferenceResolution({
  differences,
  settled,
  filter,
  onFilter
}: {
  differences: DifferenceView[]
  /** Points both chambers passed in substance, which the law kept. */
  settled: number
  filter: OutcomeFilter
  onFilter: (f: OutcomeFilter) => void
}) {
  const { t } = useTranslation("conferences")
  const counts = countOutcomes(differences)
  const total = differences.length
  const shown = OUTCOMES.filter(o => counts[o])

  return (
    <Frame aria-labelledby="resolved-h">
      <Head>
        <CardTitle id="resolved-h">{t("resolved.title")}</CardTitle>
        <p>
          {t("resolved.summary", {
            count: total,
            senate: counts.senate,
            house: counts.house,
            dropped: counts.dropped,
            neither: counts.combined + counts.modified + counts.new
          })}
          {settled > 0 && t("resolved.settled_count", { count: settled })}
        </p>
      </Head>
      <Bar role="group" aria-label={t("resolved.bar")}>
        {shown.map(o => {
          const name = t("resolved.segment", {
            label: t(`resolved.outcome.${o}`),
            count: counts[o],
            total
          })
          return (
            <Segment
              key={o}
              type="button"
              $o={o}
              $n={counts[o]}
              aria-label={name}
              title={name}
              aria-pressed={filter === o}
              onClick={() => onFilter(filter === o ? "all" : o)}
            >
              {counts[o]}
            </Segment>
          )
        })}
      </Bar>
      <Legend>
        {shown.map(o => (
          <OutcomeChip key={o} o={o} count={counts[o]} />
        ))}
      </Legend>
      <KeyToggle>
        <summary>{t("resolved.key")}</summary>
        <Key>
          {OUTCOMES.map(o => (
            <div key={o}>
              <dt>
                <OutcomeChip o={o} />
              </dt>
              <dd>{t(`resolved.meaning.${o}`)}</dd>
            </div>
          ))}
          <div>
            <dt>
              <EditedMark>{t("resolved.edited")}</EditedMark>
            </dt>
            <dd>{t("resolved.meaning.edited")}</dd>
          </div>
        </Key>
      </KeyToggle>
    </Frame>
  )
}
