import { ReactNode, useCallback, useMemo, useState } from "react"
import { useTranslation } from "next-i18next"
import { useMediaQuery } from "usehooks-ts"
import { Button, Offcanvas } from "../../bootstrap"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFilter } from "@fortawesome/free-solid-svg-icons"
import styled from "styled-components"
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
  font-size: 1rem;
  line-height: 1rem;
  min-height: 2rem;
  padding: 0.25rem 0.5rem 0.25rem 0.5rem;
  align-self: flex-start;
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
        variant="secondary"
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
        {menu ? <div>{menu}</div> : null}
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
        <RefinementList className="mb-4" key={props.attribute} {...props} />
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
