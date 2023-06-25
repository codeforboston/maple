import {
  RefinementListUiComponent,
  useInstantSearch,
  useRefinementListUiProps
} from "@alexjball/react-instantsearch-hooks-web"
import { faFilter } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useCallback, useEffect, useState } from "react"
import styled from "styled-components"
import { useMediaQuery } from "usehooks-ts"
import { Button, Col, Offcanvas } from "../bootstrap"
import { SearchContainer } from "./SearchContainer"

export const FilterButton = styled(Button)`
  font-size: 1rem;
  line-height: 1rem;
  min-height: 2rem;
  padding: 0.25rem 0.5rem 0.25rem 0.5rem;
  align-self: flex-start;
`

const useHasRefinements = () => {
  const { results } = useInstantSearch()
  const refinements = results.getRefinements()
  return refinements.length !== 0
}

export const useRefinements = ({
  refinementProps
}: {
  refinementProps: any[]
}) => {
  const inline = useMediaQuery("(min-width: 768px)")
  const [show, setShow] = useState(false)
  const handleClose = useCallback(() => setShow(false), [])
  const handleOpen = useCallback(() => setShow(true), [])

  useEffect(() => {
    if (inline) setShow(false)
  }, [inline])

  const refinements = (
    <>
      {refinementProps.map((p, i) => (
        <RefinementListUiComponent className="mb-4" key={i} {...(p as any)} />
      ))}
    </>
  )
  const hasRefinements = useHasRefinements()

  return {
    options: inline ? (
      <Col xs={3} lg={3}>
        {refinements}
      </Col>
    ) : (
      <Offcanvas show={show} onHide={handleClose}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Filter</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <SearchContainer>{refinements}</SearchContainer>
        </Offcanvas.Body>
      </Offcanvas>
    ),
    show: inline ? null : (
      <FilterButton
        variant="secondary"
        active={show}
        onClick={handleOpen}
        className={hasRefinements ? "ais-FilterButton-has-refinements" : ""}
      >
        <FontAwesomeIcon icon={faFilter} /> Filter
      </FilterButton>
    )
  }
}
