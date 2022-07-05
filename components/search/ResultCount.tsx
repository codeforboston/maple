import { useConnector } from "@alexjball/react-instantsearch-hooks-web"
import connectStats from "instantsearch.js/es/connectors/stats/connectStats"
import styled from "styled-components"

function useStats(): any {
  return useConnector(connectStats)
}

const ResultContainer = styled.span`
  font-size: 0.75rem;
`
export function ResultCount(props: any) {
  const { hitsPerPage, nbHits, page } = useStats()

  const pageStart = Math.min(page * hitsPerPage + 1, nbHits)
  const pageEnd = Math.min(pageStart + hitsPerPage - 1, nbHits)

  return (
    <ResultContainer {...props}>
      Showing {pageStart}-{pageEnd} of {nbHits} Results
    </ResultContainer>
  )
}
