import { useTranslation } from "next-i18next"
import styled from "styled-components"

export type TestimonyCounts = {
  support: number
  oppose: number
  neutral: number
}

const POSITIONS = ["support", "oppose", "neutral"] as const

const Bar = styled.span`
  display: flex;
  height: 8px;
  border-radius: var(--maple-radius-pill);
  overflow: hidden;
  background: var(--maple-color-gray-subtle-border);
`

const Segment = styled.span<{ $position: string; $share: number }>`
  height: 100%;
  width: ${p => p.$share}%;
  background: var(--maple-testimony-${p => p.$position});
`

const Legend = styled.span`
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  font-size: 0.82rem;
  color: var(--maple-text-body);
  font-variant-numeric: tabular-nums;
`

const Dot = styled.i<{ $position: string }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 5px;
  vertical-align: 1px;
  background: var(--maple-testimony-${p => p.$position});
`

const None = styled.span`
  font-size: 0.82rem;
  color: var(--maple-text-muted);
`

/** Signature element: how residents testified. The visible counts mean colour is never the only signal. */
export function TestimonySplit({ counts }: { counts: TestimonyCounts }) {
  const { t } = useTranslation("chat")
  const total = counts.support + counts.oppose + counts.neutral
  if (total === 0) return <None>{t("split.none")}</None>

  return (
    <>
      <Bar role="img" aria-label={t("split.label", counts)}>
        {POSITIONS.map(p => (
          <Segment key={p} $position={p} $share={(counts[p] / total) * 100} />
        ))}
      </Bar>
      <Legend aria-hidden="true">
        {POSITIONS.map(p => (
          <span key={p}>
            <Dot $position={p} />
            {t(`split.${p}`, { count: counts[p] })}
          </span>
        ))}
      </Legend>
    </>
  )
}
