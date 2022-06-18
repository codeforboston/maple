import {
  RefinementListUiComponent,
  useRefinementListUiProps
} from "@alexjball/react-instantsearch-hooks-web"
import { faFilter } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useCallback, useEffect, useState } from "react"
import { useMediaQuery } from "usehooks-ts"
import { Col, Offcanvas } from "../bootstrap"
import { FilterButton, SatelliteCustomization } from "./common"

export const useRefinements = () => {
  const inline = useMediaQuery("(min-width: 768px)")
  const [show, setShow] = useState(false)
  const handleClose = useCallback(() => setShow(false), [])
  const handleOpen = useCallback(() => setShow(true), [])

  useEffect(() => {
    if (inline) setShow(false)
  }, [inline])

  const baseProps = { limit: 5, searchable: true }
  const refinementProps = [
    useRefinementListUiProps({
      attribute: "city",
      searchablePlaceholder: "City",
      ...baseProps
    }),
    useRefinementListUiProps({
      attribute: "primarySponsor",
      ...baseProps,
      searchablePlaceholder: "Primary Sponsor"
    }),
    useRefinementListUiProps({
      attribute: "cosponsors",
      ...baseProps,
      searchablePlaceholder: "Cosponsor"
    }),
    useRefinementListUiProps({
      attribute: "currentCommittee",
      ...baseProps,
      searchablePlaceholder: "Current Committee"
    })
  ]

  const refinements = (
    <>
      {refinementProps.map((p, i) => (
        <RefinementListUiComponent className="mb-4" key={i} {...(p as any)} />
      ))}
    </>
  )

  return {
    options: inline ? (
      <Col xs={3} lg={3} className="mt-3">
        {refinements}
      </Col>
    ) : (
      <Offcanvas show={show} onHide={handleClose}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Filter</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <SatelliteCustomization>{refinements}</SatelliteCustomization>
        </Offcanvas.Body>
      </Offcanvas>
    ),
    show: inline ? null : (
      <FilterButton
        className="mb-2 me-2"
        variant="secondary"
        active={show}
        onClick={handleOpen}
      >
        <FontAwesomeIcon icon={faFilter} /> Filter
      </FilterButton>
    )
  }
}
