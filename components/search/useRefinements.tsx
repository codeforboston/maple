import { useTranslation } from "next-i18next"
import Image from "react-bootstrap/Image"
import {
  RefinementList,
  RefinementListProps,
  useInstantSearch
} from "react-instantsearch"
import { Tooltip } from "react-tooltip"
import { faFilter } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useCallback, useState } from "react"
import styled from "styled-components"
import { useMediaQuery } from "usehooks-ts"
import { Button, Offcanvas } from "../bootstrap"
import {
  MultiselectHierarchicalMenu,
  MultiselectHierarchicalMenuParams
} from "./HierarchicalMenuWidget"
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
        src="/info2.svg"
        alt=""
        width="25"
        height="25"
        className="ms-2 mb-1"
        id="clickable"
      />
      <Tooltip
        anchorSelect="#clickable"
        clickable
        place="top"
        style={{ maxWidth: "220px", opacity: 1, zIndex: "6" }}
      >
        {t("city_tooltip1")}
        <a
          href="https://www.somervillecdc.org/news/what-is-a-home-rule-petition/#:~:text=A%20Home%20Rule%20Petition%20is,an%20aspect%20of%20state%20law"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "rgba(173, 216, 230, 1)" }}
        >
          {t("home_rule_petition")}
        </a>
        {t("city_tooltip2")}
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
  hierarchicalMenuProps?: MultiselectHierarchicalMenuParams
  refinementProps: RefinementListProps[]
  refinementProps2?: RefinementListProps[]
}) => {
  const inline = useMediaQuery("(min-width: 768px)")
  const [show, setShow] = useState(false)
  const handleClose = useCallback(() => setShow(false), [])
  const handleOpen = useCallback(() => setShow(true), [])

  const refinements = (
    <>
      {refinementProps.map((p, i) => (
        <RefinementList className="mb-4" key={i} {...p} />
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
            hierarchicalMenuProps[].attribute,
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
