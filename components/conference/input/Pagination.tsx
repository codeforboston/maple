import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { ChevronLeft, ChevronRight } from "./icons"
import { brand, ink, red } from "./tokens"

/** Zero-based page numbers with "…" gaps: ‹ 1 2 3 … n ›. */
function pageWindow(current: number, count: number): (number | "…")[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i)
  const around = [current - 1, current, current + 1].filter(
    p => p > 0 && p < count - 1
  )
  const items: (number | "…")[] = [0]
  if (around[0] > 1) items.push("…")
  items.push(...around)
  if (around[around.length - 1] < count - 2) items.push("…")
  items.push(count - 1)
  return items
}

const Row = styled.nav`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: 18px;
  font-size: 0.8125rem;

  @media (max-width: 639.98px) {
    gap: 4px;
  }
`

const Step = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  padding: 0;
  background: none;
  color: ${ink.strong};
  &:hover:not(:disabled) {
    color: ${red.hover};
  }
  &:disabled {
    color: ${ink.faint};
  }
  @media (max-width: 639.98px) {
    width: 52px;
    height: 52px;
  }
`

const Num = styled.button<{ $on: boolean }>`
  border: 0;
  padding: 0;
  background: none;
  font-size: 0.8125rem;
  color: ${({ $on }) => ($on ? ink.strong : brand.fill)};
  font-weight: ${({ $on }) => ($on ? 600 : 400)};
  &:hover:not([aria-current]) {
    color: ${red.hover};
  }
  @media (max-width: 639.98px) {
    display: none;
  }
`

const Gap = styled.span`
  color: ${ink.mid};
  @media (max-width: 639.98px) {
    display: none;
  }
`

const Of = styled.span`
  display: none;
  font-size: 0.875rem;
  color: ${ink.mid};
  font-variant-numeric: tabular-nums;
  @media (max-width: 639.98px) {
    display: inline;
  }
`

export function Pagination({
  page,
  pageCount,
  onPage
}: {
  page: number
  pageCount: number
  onPage: (p: number) => void
}) {
  const { t } = useTranslation("conferences")
  return (
    <Row aria-label={t("input.title")}>
      <Step
        type="button"
        onClick={() => onPage(page - 1)}
        disabled={page === 0}
        aria-label={t("input.previous_page")}
      >
        <ChevronLeft />
      </Step>
      <Of>{t("input.page_of", { page: page + 1, count: pageCount })}</Of>
      {pageWindow(page, pageCount).map((item, i) =>
        item === "…" ? (
          <Gap key={`gap-${i}`}>…</Gap>
        ) : (
          <Num
            key={item}
            type="button"
            $on={item === page}
            aria-current={item === page ? "page" : undefined}
            onClick={() => onPage(item)}
          >
            {item + 1}
          </Num>
        )
      )}
      <Step
        type="button"
        onClick={() => onPage(page + 1)}
        disabled={page >= pageCount - 1}
        aria-label={t("input.next_page")}
      >
        <ChevronRight />
      </Step>
    </Row>
  )
}
