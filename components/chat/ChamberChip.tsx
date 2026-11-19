import { useTranslation } from "next-i18next"
import styled from "styled-components"

export type Chamber = "house" | "senate"

/** MAPLE bill ids start with H or S (e.g. H1440, S886). */
export const chamberOf = (billId: string): Chamber =>
  billId.startsWith("S") ? "senate" : "house"

/** "H1440" -> "H.1440", as residents see it on MAPLE. */
export const formatBillNumber = (billId: string) =>
  billId.replace(/^([HS])(\d)/, "$1.$2")

const Chip = styled.span<{ $chamber: Chamber }>`
  font-size: 0.74rem;
  font-weight: 800;
  color: var(--maple-text-inverse);
  padding: 2px 8px;
  border-radius: var(--maple-radius-pill);
  background: ${p =>
    p.$chamber === "senate"
      ? "var(--maple-brand-senate)"
      : "var(--maple-brand-primary)"};
`

export function ChamberChip({ billId }: { billId: string }) {
  const { t } = useTranslation("chat")
  const chamber = chamberOf(billId)
  return <Chip $chamber={chamber}>{t(`chamber.${chamber}`)}</Chip>
}
