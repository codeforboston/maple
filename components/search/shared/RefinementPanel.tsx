import { ReactNode, useCallback, useMemo, useState } from "react"
import { useTranslation } from "next-i18next"
import { useMediaQuery } from "usehooks-ts"
import { Button, Offcanvas } from "../../bootstrap"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFilter } from "@fortawesome/free-solid-svg-icons"
import styled from "styled-components"

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
import {
  useInstantSearch,
  RefinementList,
  RefinementListProps
} from "react-instantsearch"
import {
  MultiselectHierarchicalMenu,
  MultiselectHierarchicalMenuParams
} from "../HierarchicalMenuWidget"
import { SearchContainer } from "../SearchContainer"

export type RefinementPanelConfig = {
  filters: RefinementListProps[]
  menuProps?: MultiselectHierarchicalMenuParams
}

type BasePanelElements = {
  filterPanel: ReactNode
  filterToggle: ReactNode | null
}

type MobilePanelProps = {
  title: string
  isOpen: boolean
  onClose: () => void
  menu: ReactNode | null
  refinementLists: ReactNode[]
}

const FilterButton = styled(Button)`
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

const MobileFilterPanel = ({
  title,
  isOpen,
  onClose,
  menu,
  refinementLists
}: MobilePanelProps) => (
  <Offcanvas show={isOpen} onHide={onClose} placement="start">
    <Offcanvas.Header closeButton>
      <Offcanvas.Title>{title}</Offcanvas.Title>
    </Offcanvas.Header>
    <Offcanvas.Body>
      {menu ? <SearchContainer>{menu}</SearchContainer> : null}
      {refinementLists.length ? (
        <SearchContainer>{refinementLists}</SearchContainer>
      ) : null}
    </Offcanvas.Body>
  </Offcanvas>
)

const createMobileFilterElements = ({
  title,
  isOpen,
  hasRefinements,
  onOpen,
  onClose,
  menu,
  refinementLists
}: MobilePanelProps & {
  hasRefinements: boolean
  onOpen: () => void
}): BasePanelElements => {
  return {
    filterPanel: (
      <MobileFilterPanel
        title={title}
        isOpen={isOpen}
        onClose={onClose}
        menu={menu}
        refinementLists={refinementLists}
      />
    ),
    filterToggle: (
      <FilterButton
        variant="outline-secondary"
        size="sm"
        active={isOpen}
        onClick={onOpen}
        className={hasRefinements ? "ais-FilterButton-has-refinements" : ""}
      >
        <FontAwesomeIcon icon={faFilter} /> {title}
      </FilterButton>
    )
  }
}

const createDesktopFilterElements = ({
  menu,
  refinementLists
}: {
  menu: ReactNode | null
  refinementLists: ReactNode[]
}): BasePanelElements => {
  return {
    filterPanel: (
      <>
        {menu ? (
          <FilterSection>
            <FilterLabel>Topics</FilterLabel>
            {menu}
          </FilterSection>
        ) : null}
        {refinementLists.length ? <div>{refinementLists}</div> : null}
      </>
    ),
    filterToggle: null
  }
}

const useHasRefinements = () => {
  return useInstantSearch().results.getRefinements().length > 0
}

type RefinementPanelProps = RefinementPanelConfig & {
  children: (result: BasePanelElements) => ReactNode
}

export const RefinementPanel = ({
  menuProps,
  filters,
  children
}: RefinementPanelProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const hasRefinements = useHasRefinements()
  const [isOpen, setIsOpen] = useState(false)
  const menu = useMemo(
    () => (menuProps ? <MultiselectHierarchicalMenu {...menuProps} /> : null),
    [menuProps]
  )
  const refinementLists = useMemo(
    () =>
      filters.map(props => (
        <FilterSection key={props.attribute}>
          <FilterLabel>{formatAttributeLabel(props.attribute)}</FilterLabel>
          <RefinementList {...props} />
        </FilterSection>
      )),
    [filters]
  )
  const openMobilePanel = useCallback(() => setIsOpen(true), [])
  const closeMobilePanel = useCallback(() => setIsOpen(false), [])
  const { t } = useTranslation("search")
  const { filterPanel, filterToggle } = isDesktop
    ? createDesktopFilterElements({ menu, refinementLists })
    : createMobileFilterElements({
        title: t("filter"),
        isOpen,
        hasRefinements,
        onOpen: openMobilePanel,
        onClose: closeMobilePanel,
        menu,
        refinementLists
      })

  return <>{children({ filterPanel, filterToggle })}</>
}
