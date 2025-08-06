import { useTranslation } from "next-i18next"
import { RefinementList, useInstantSearch } from "react-instantsearch"
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

const useHasRefinements = () => {
  const { results } = useInstantSearch()
  const refinements = results.getRefinements()
  return refinements.length !== 0
}

export const useRefinements = ({
  hierarchicalMenuProps,
  refinementProps
}: {
  hierarchicalMenuProps?: any[]
  refinementProps: any[]
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

  const { t } = useTranslation("search")

  return {
    options: inline ? (
      <>
        <div>{hierarchicalMenu}</div>
        <div>{refinements}</div>
      </>
    ) : (
      <Offcanvas show={show} onHide={handleClose}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{t("filter")}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <SearchContainer>{hierarchicalMenu}</SearchContainer>
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
        <FontAwesomeIcon icon={faFilter} /> {t("filter")}
      </FilterButton>
    )
  }
}
