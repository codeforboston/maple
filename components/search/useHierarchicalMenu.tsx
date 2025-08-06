import { useTranslation } from "next-i18next"
import { useInstantSearch } from "react-instantsearch"
import { faFilter } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useCallback, useState } from "react"
import styled from "styled-components"
import { useMediaQuery } from "usehooks-ts"
import { Button, Offcanvas } from "../bootstrap"
import { SearchContainer } from "./SearchContainer"
import { MultiselectHierarchicalMenu } from "./HierarchicalMenuWidget"
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

export const useHierarchicalMenu = ({
  hierarchicalMenuProps
}: {
  hierarchicalMenuProps: any[]
}) => {
  const inline = useMediaQuery("(min-width: 768px)")
  const [show, setShow] = useState(false)
  const handleClose = useCallback(() => setShow(false), [])
  const handleOpen = useCallback(() => setShow(true), [])

  const hierarchicalMenu = (
    <>
      <MultiselectHierarchicalMenu
        attributes={[
          hierarchicalMenuProps[0].attribute,
          hierarchicalMenuProps[1].attribute
        ]}
      />
    </>
  )
  const hasRefinements = useHasRefinements()

  const { t } = useTranslation("search")

  return {
    options: inline ? (
      <div>{hierarchicalMenu}</div>
    ) : (
      <Offcanvas show={show} onHide={handleClose}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{t("topics")}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <SearchContainer>{hierarchicalMenu}</SearchContainer>
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
        <FontAwesomeIcon icon={faFilter} /> {t("topics")}
      </FilterButton>
    )
  }
}
