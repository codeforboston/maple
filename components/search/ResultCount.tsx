import { useTranslation } from "next-i18next"
import { useStats } from "react-instantsearch"
import styled from "styled-components"

const ResultContainer = styled.span`
  color: var(--bs-gray-600);
  font-size: 0.95rem;
  font-weight: var(--maple-font-weight-semibold);
`
export function ResultCount(props: any) {
  const { hitsPerPage, nbHits, page } = useStats()

  const limit = hitsPerPage || 0
  const pageStart = Math.min(page * limit + 1, nbHits)
  const pageEnd = Math.min(pageStart + limit - 1, nbHits)

  return (
    <ResultContainer {...props}>
      {useTranslation("search").t("result_count", {
        pageStart,
        pageEnd,
        nbHits
      })}
    </ResultContainer>
  )
}
