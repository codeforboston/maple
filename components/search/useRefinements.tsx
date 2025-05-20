import { useTranslation } from "next-i18next"
import Image from "react-bootstrap/Image"
import { RefinementList, useInstantSearch } from "react-instantsearch"
import { Tooltip } from "react-tooltip"
import { faFilter } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useCallback, useState } from "react"
import styled from "styled-components"
import { useMediaQuery } from "usehooks-ts"
import { Button, Offcanvas } from "../bootstrap"
import { MultiselectHierarchicalMenu } from "./HierarchicalMenuWidget"
import { SearchContainer } from "./SearchContainer"

export const FilterButton = styled(Button)`
  font-size: 1rem;
  line-height: 1rem;
  min-height: 2rem;
  padding: 0.25rem 0.5rem 0.25rem 0.5rem;
  align-self: flex-start;
`

export const CityTooltip = () => {
  const { t } = useTranslation("billSearch")

  return (
    <>
      <Image
        src="/info.svg"
        alt={t("navigation.closeNavMenu")}
        width="25"
        height="25"
        className="ms-2 my-anchor-element mb-1"
      />
      <Tooltip
        anchorSelect=".my-anchor-element"
        place="top"
        style={{ maxWidth: "220px", zIndex: "6" }}
      >
        This filter only captures bills submitted via "home rule" petition;
        which is when a town/city requires the state’s approval to implement a
        policy. This does not capture every bill that concerns or affects a
        specific city.
      </Tooltip>
    </>
  )
}

const useHasRefinements = () => {
  const { results } = useInstantSearch()
  const refinements = results.getRefinements()
  return refinements.length !== 0
}

export const useRefinements = ({
  hierarchicalMenuProps,
  refinementProps,
  refinementProps2
}: {
  hierarchicalMenuProps?: any[]
  refinementProps: any[]
  refinementProps2?: any[]
}) => {
  const inline = useMediaQuery("(min-width: 768px)")
  const [show, setShow] = useState(false)
  const handleClose = useCallback(() => setShow(false), [])
  const handleOpen = useCallback(() => setShow(true), [])

  const refinements = (
    <>
      {refinementProps.map((p, i) => (
        <RefinementList className="mb-4" key={i} {...(p as any)} />
      ))}
    </>
  )

  let refinements2 = <></>

  if (refinementProps2) {
    refinements2 = (
      <>
        {refinementProps2.map((p, i) => (
          <RefinementList className="mb-4" key={i} {...(p as any)} />
        ))}
      </>
    )
  }

  let hierarchicalMenu = <></>

  if (hierarchicalMenuProps) {
    hierarchicalMenu = (
      <>
        <MultiselectHierarchicalMenu
          attributes={[
            hierarchicalMenuProps[0].attribute,
            hierarchicalMenuProps[1].attribute
          ]}
        />
      </>
    )
  }

  const hasRefinements = useHasRefinements()

  const { t } = useTranslation("billSearch")

  return {
    options: inline ? (
      <>
        <div>{hierarchicalMenu}</div>
        <div>{refinements}</div>
        {refinementProps2 ? <CityTooltip /> : <></>}
        <div>{refinements2}</div>
      </>
    ) : (
      <Offcanvas show={show} onHide={handleClose}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{t("filter")}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <SearchContainer>{hierarchicalMenu}</SearchContainer>
          <SearchContainer>{refinements}</SearchContainer>
          <SearchContainer>
            {refinementProps2 ? <CityTooltip /> : <></>}
          </SearchContainer>
          <SearchContainer>{refinements2}</SearchContainer>
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
        <FontAwesomeIcon icon={faFilter} /> {t("filter")}
      </FilterButton>
    )
  }
}
