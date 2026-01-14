import { Hit } from "instantsearch.js"
import { ComponentType, useState } from "react"
import { useTranslation } from "next-i18next"
import { Hits, useInstantSearch } from "react-instantsearch"
import styled from "styled-components"
import { Container, Spinner } from "../../bootstrap"
import { NoResults } from "../NoResults"

const StyledLoadingContainer = styled(Container)`
  background-color: white;
  display: flex;
  height: 300px;
  justify-content: center;
  align-items: center;
`

export type SearchStatus = "loading" | "empty" | "results"

export const useSearchStatus = (): SearchStatus => {
  const { results } = useInstantSearch()
  if (!results.query) return "loading"
  if (results.nbHits === 0) return "empty"
  return "results"
}

type ResultsPaneProps<TRecord extends Hit> = {
  hitComponent: ComponentType<{ hit: TRecord }>
}

export const ResultsPane = <TRecord extends Hit>({
  hitComponent
}: ResultsPaneProps<TRecord>) => {
  const { t } = useTranslation("search")
  const status = useSearchStatus()
  const [isNavigating, setIsNavigating] = useState(false)

  if (status === "loading" || isNavigating) {
    return (
      <StyledLoadingContainer>
        <Spinner animation="border" className="mx-auto" />
      </StyledLoadingContainer>
    )
  }

  if (status === "empty") {
    return (
      <NoResults>
        {t("zero_results")}
        <br />
        <b>{t("another_term")}</b>
      </NoResults>
    )
  }

  return (
    <Hits hitComponent={hitComponent} onClick={() => setIsNavigating(true)} />
  )
}
