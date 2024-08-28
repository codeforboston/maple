import { useStats } from "react-instantsearch"
import styled from "styled-components"

const ResultContainer = styled.span`
  font-size: 0.75rem;
`
export function ResultCount(props: any) {
  const { hitsPerPage, nbHits, page } = useStats()

  const limit = hitsPerPage || 0
  const pageStart = Math.min(page * limit + 1, nbHits)
  const pageEnd = Math.min(pageStart + limit - 1, nbHits)

  return (
    <ResultContainer {...props}>
      Showing {pageStart}-{pageEnd} of {nbHits} Results
    </ResultContainer>
  )
}
