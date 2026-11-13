import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { billUrl, external } from "./links"
import { ChamberChip, formatBillNumber } from "./ChamberChip"
import { ChevronIcon } from "./Icons"
import { TestimonySplit, type TestimonyCounts } from "./TestimonySplit"

/** Mirrors chat-agent's search_bills result; cards render only from tool results, never model text. */
export type ChatBill = {
  id: string
  court: number
  title: string | null
  primarySponsor: string | null
  committee: string | null
  testimonyCounts: TestimonyCounts
}

const Card = styled.a`
  display: flex;
  flex-direction: column;
  gap: var(--maple-space-sm);
  padding: 14px 16px;
  border-radius: var(--maple-radius-xl);
  background: var(--maple-surface-base);
  box-shadow: var(--maple-shadow-sm);
  color: inherit;
  text-decoration: none;
  transition: box-shadow var(--maple-transition-base),
    transform var(--maple-transition-base);

  &:hover {
    box-shadow: var(--maple-shadow-hover);
    transform: translateY(-1px);
    color: inherit;
  }

  &:focus-visible {
    outline: 3px solid var(--maple-chat-focus);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    &:hover {
      transform: none;
    }
  }
`

const Top = styled.span`
  display: flex;
  align-items: center;
  gap: var(--maple-space-sm);
`

const Number = styled.span`
  font-weight: 800;
  color: var(--maple-text-strong);
  font-variant-numeric: tabular-nums;
`

const Title = styled.span`
  color: var(--maple-text-strong);
  font-weight: 700;
  line-height: 1.35;
`

const Meta = styled.span`
  font-size: 0.84rem;
  color: var(--maple-text-muted);
`

const Open = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--maple-brand-primary);
`

export function BillRecord({ bill }: { bill: ChatBill }) {
  const { t } = useTranslation("chat")
  const number = formatBillNumber(bill.id)
  const meta = [
    bill.primarySponsor && t("record.sponsor", { name: bill.primarySponsor }),
    bill.committee
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <Card href={billUrl(bill)} {...external}>
      <Top>
        <ChamberChip billId={bill.id} />
        <Number>{number}</Number>
      </Top>
      {bill.title && <Title>{bill.title.trim()}</Title>}
      {meta && <Meta>{meta}</Meta>}
      <TestimonySplit counts={bill.testimonyCounts} />
      <Open>
        {t("record.open", { bill: number })}
        <ChevronIcon />
      </Open>
    </Card>
  )
}

const Heading = styled.h2`
  margin: 0 0 10px;
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--maple-text-muted);
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--maple-space-md);

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`

export function BillRecords({ bills }: { bills: ChatBill[] }) {
  const { t } = useTranslation("chat")
  if (bills.length === 0) return null
  return (
    <section>
      <Heading>{t("record.sourcesHeading")}</Heading>
      <Grid>
        {bills.map(b => (
          <BillRecord key={`${b.court}/${b.id}`} bill={b} />
        ))}
      </Grid>
    </section>
  )
}
