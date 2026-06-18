import { useTranslation } from "next-i18next"
import {
  RefinementList,
  RefinementListProps,
  useInstantSearch
} from "react-instantsearch"
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
  flex: 0 0 auto;
  font-size: 0.9rem;
  padding: var(--maple-space-xs) var(--maple-space-sm);
  white-space: nowrap;
  align-self: flex-start;

  &:focus-visible {
    outline: 2px solid var(--maple-focus-ring);
    outline-offset: 2px;
  }
`

const FilterSection = styled.div`
  background: white;
  border: 1px solid var(--maple-surface-border);
  border-radius: var(--maple-radius-md);
  box-shadow: var(--maple-shadow-sm);
  padding: var(--maple-space-md) var(--maple-space-lg);
  margin-bottom: var(--maple-space-md);
`

const FilterLabel = styled.p`
  color: var(--bs-gray-700);
  font-size: 0.78rem;
  font-weight: var(--maple-font-weight-bold);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: var(--maple-space-sm);
`

const ATTRIBUTE_LABELS: Record<string, string> = {
  court: "Legislative Session",
  currentCommittee: "Committee",
  committeeName: "Committee",
  city: "City",
  primarySponsor: "Primary Sponsor",
  cosponsors: "Cosponsors",
  "topics.lvl0": "Topics",
  authorDisplayName: "Author",
  position: "Position",
  billId: "Bill",
  hasVideo: "Video",
  month: "Month",
  year: "Year",
  chairNames: "Chairs"
}

const formatAttributeLabel = (attribute: string): string =>
  ATTRIBUTE_LABELS[attribute] ??
  attribute.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())

const useHasRefinements = () => {
  const { results } = useInstantSearch()
  const refinements = results.getRefinements()
  return refinements.length !== 0
}

export const useRefinements = ({
  hierarchicalMenuProps,
  refinementProps
}: {
  hierarchicalMenuProps?: MultiselectHierarchicalMenuParams
  refinementProps: RefinementListProps[]
}) => {
  const inline = useMediaQuery("(min-width: 768px)")
  const [show, setShow] = useState(false)
  const handleClose = useCallback(() => setShow(false), [])
  const handleOpen = useCallback(() => setShow(true), [])

  const refinements = (
    <>
      {refinementProps
        .filter((p: any) => !p.hidden)
        .map((p, i) => (
          <FilterSection key={i}>
            <FilterLabel>{formatAttributeLabel(p.attribute)}</FilterLabel>
            <RefinementList {...p} />
          </FilterSection>
        ))}
    </>
  )

  const hierarchicalMenu = hierarchicalMenuProps ? (
    <FilterSection>
      <FilterLabel>Topics</FilterLabel>
      <MultiselectHierarchicalMenu {...hierarchicalMenuProps} />
    </FilterSection>
  ) : (
    <></>
  )

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
        variant="outline-secondary"
        size="sm"
        active={show}
        onClick={handleOpen}
        className={hasRefinements ? "ais-FilterButton-has-refinements" : ""}
      >
        <FontAwesomeIcon icon={faFilter} /> {t("filter")}
      </FilterButton>
    )
  }
}
