import { useConnector } from "react-instantsearch"
import type { SearchResults } from "algoliasearch-helper"
import type { Connector } from "instantsearch.js"
import type { AdditionalWidgetProperties } from "react-instantsearch"
import { useCallback, useEffect, useMemo, useState } from "react"

const cx = (...classNames: string[]): string =>
  classNames.filter(Boolean).join(" ")

// Types

type MultiselectHierarchicalMenuItem = SearchResults.FacetValue & {
  label: string
}

type MultiselectHierarchicalMenuLevel = {
  attribute: string
  items: MultiselectHierarchicalMenuItem[]
  refine: (value: string) => void
}

type MultiselectHierarchicalMenuRender = {
  levels: MultiselectHierarchicalMenuLevel[]
}

type MultiselectHierarchicalMenuState = {
  levels: MultiselectHierarchicalMenuLevel[]
  refinements: string[]
}

type MultiselectHierarchicalMenuWidget = {
  $$type: string
  renderState: MultiselectHierarchicalMenuRender
  indexRenderState: {
    multiselectHierarchicalMenu: MultiselectHierarchicalMenuRender
  }
  indexUiState: {
    multiselectHierarchicalMenu: MultiselectHierarchicalMenuRender
  }
}

export type MultiselectHierarchicalMenuParams = {
  attributes: string[]
  separator?: string
}

// Connector

export type MultiselectHierarchicalMenuConnector = Connector<
  MultiselectHierarchicalMenuWidget,
  MultiselectHierarchicalMenuParams
>

export const connectMultiselectHierarchicalMenu: MultiselectHierarchicalMenuConnector =
  (renderFn, unmountFn = () => {}) => {
    return widgetParams => {
      const { attributes, separator } = widgetParams
      // Store information that needs to be shared across multiple method calls.
      const connectorState: MultiselectHierarchicalMenuState = {
        levels: [],
        refinements: []
      }

      return {
        $$type: "ais.multiselectHierarchicalMenu",
        getWidgetRenderState({ results, helper }) {
          // When there are no results, return the API with default values.
          if (!results) return { levels: [], widgetParams }

          // Get the last refinement.
          const lastRefinement = results.getRefinements().pop()?.attributeName

          // Merge the results items with the initial ones.
          const getItems = (
            attribute: string,
            isParent: boolean
          ): MultiselectHierarchicalMenuItem[] => {
            const sortByParameter = isParent ? ["name:asc"] : ["count:desc"]

            const facetValues =
              (results?.getFacetValues(attribute, {
                sortBy: sortByParameter
              }) as SearchResults.FacetValue[]) || []

            // Mapping over facetValues with an additional safety check
            const resultsItems =
              facetValues.length > 0
                ? facetValues.map(facetValue => ({
                    ...facetValue,
                    label: facetValue.name
                      .split(separator || " > ")
                      .pop() as string,
                    count: facetValue.count
                  }))
                : []
            if (lastRefinement && !attributes.includes(lastRefinement))
              return resultsItems

            const level = connectorState.levels.find(
              level => level.attribute === attribute
            )
            const levelItems = level?.items || []

            if (!levelItems.length && resultsItems.length) return resultsItems
            if (!resultsItems.length) return levelItems

            // Merge and sort items from results and existing state
            const mergedItems = levelItems.map(levelItem => {
              const resultsItem = resultsItems.find(
                resultItem => resultItem.name === levelItem.name
              )
              return resultsItem ? { ...levelItem, ...resultsItem } : levelItem
            })

            return mergedItems
          }

          // Register refinements and items for each attribute.
          for (let i = 0; i < attributes.length; i++) {
            const attribute = attributes[i]
            if (!connectorState.levels[i]) {
              const refine = (value: string) => {
                for (const attr of attributes) {
                  const isLastAttribute =
                    attribute === attributes[attributes.length - 1] &&
                    attribute === attr
                  if (
                    !isLastAttribute &&
                    helper.getRefinements(attr).length > 0
                  )
                    helper.clearRefinements(attr)
                }
                const refinement = helper
                  .getRefinements(attribute)
                  .find(ref => ref.value === value)

                if (!refinement) {
                  helper.addDisjunctiveFacetRefinement(attribute, value)
                } else {
                  helper.removeDisjunctiveFacetRefinement(attribute, value)
                }
                helper.search()
              }

              connectorState.levels[i] = { attribute, refine, items: [] }
            }

            // Register the initial items.
            if (results && !connectorState.levels[i].items.length) {
              connectorState.levels[i].items = getItems(attribute, i === 0)
            }
          }

          // Call the getItems to get the updated items state.
          const levels = connectorState.levels.map((level, i) => ({
            ...level,
            items: getItems(level.attribute, i === 0)
          }))

          return { levels, widgetParams }
        },
        getRenderState(renderState, renderOptions) {
          return {
            ...renderState,
            multiselectHierarchicalMenu: {
              ...renderState.multiselectHierarchicalMenu,
              ...this.getWidgetRenderState(renderOptions)
            }
          }
        },
        init(initOptions) {
          const { helper, instantSearchInstance } = initOptions
          attributes.forEach(attr => {
            if (!helper.state.disjunctiveFacets.includes(attr)) {
              helper.setQueryParameter("disjunctiveFacets", [
                ...helper.state.disjunctiveFacets,
                attr
              ])
            }
          })
          helper.search()

          renderFn(
            {
              ...this.getWidgetRenderState(initOptions),
              instantSearchInstance
            },
            true
          )
        },
        render(renderOptions) {
          const { instantSearchInstance } = renderOptions

          renderFn(
            {
              ...this.getWidgetRenderState(renderOptions),
              instantSearchInstance
            },
            false
          )
        },
        dispose() {
          unmountFn()
        },
        getWidgetUiState(uiState, { searchParameters }) {
          const state = attributes.reduce(
            (levelState, attribute) => ({
              ...levelState,
              [attribute]:
                searchParameters.getDisjunctiveRefinements(attribute) || []
            }),
            {}
          )

          return {
            ...uiState,
            multiselectHierarchicalMenu: {
              ...uiState.multiselectHierarchicalMenu,
              levels: uiState.multiselectHierarchicalMenu?.levels || [],
              ...state
            }
          }
        },
        getWidgetSearchParameters(searchParameters, { uiState }) {
          for (const attribute of attributes) {
            const allTags =
              (uiState.multiselectHierarchicalMenu?.[
                attribute as keyof MultiselectHierarchicalMenuRender
              ] as unknown as string[]) || []

            if (Array.isArray(allTags)) {
              const currentRefinements =
                searchParameters.disjunctiveFacetsRefinements[attribute] || []

              const newTags = allTags.filter(
                allTags => !currentRefinements.includes(allTags)
              )

              searchParameters.disjunctiveFacetsRefinements = {
                ...searchParameters.disjunctiveFacetsRefinements,
                [attribute]: [...currentRefinements, ...newTags]
              }
            }
          }

          return searchParameters
        }
      }
    }
  }

// Hook

export const useMultiselectHierarchicalMenu = (
  props: MultiselectHierarchicalMenuParams,
  additionalWidgetProperties?: AdditionalWidgetProperties
): MultiselectHierarchicalMenuState => {
  return useConnector(
    connectMultiselectHierarchicalMenu as any,
    props,
    additionalWidgetProperties
  ) as MultiselectHierarchicalMenuState
}

// Component

type MultiselectHierarchicalMenuElementProps = {
  levels: MultiselectHierarchicalMenuLevel[]
  index?: number
  item?: SearchResults.FacetValue & { label: string }
}

const MultiselectHierarchicalMenuItem = ({
  levels,
  index = 0,
  item = {
    name: "",
    label: "",
    escapedValue: "",
    count: 0,
    isRefined: false,
    isExcluded: false
  }
}: MultiselectHierarchicalMenuElementProps): JSX.Element => {
  const subLevelItems = useMemo(() => {
    const subLevel = levels[index + 1]
    if (!subLevel) return []
    return subLevel.items.filter(subItem => subItem.name.startsWith(item.name))
  }, [levels, index, item])

  const hasSubLevel: boolean = useMemo(
    () => subLevelItems.length > 0,
    [subLevelItems.length]
  )

  const isSubLevelRefined: boolean = useMemo(
    () => subLevelItems.some(subItem => subItem.isRefined),
    [subLevelItems]
  )

  const [isOpen, setIsOpen] = useState<boolean>(
    item.isRefined || isSubLevelRefined
  )

  const { refine }: MultiselectHierarchicalMenuLevel = useMemo(
    () => levels[index],
    [levels, index]
  )

  const onButtonClick = useCallback(() => {
    if (isOpen) {
      // Clear all refinements
      levels.forEach(level => {
        level.items.forEach(subItem => {
          if (subItem.isRefined) {
            level.refine(subItem.name)
          }
        })
      })
    }
    setIsOpen(!isOpen)
  }, [isOpen, levels])

  const onLabelClick = useCallback(() => {
    if (item.isRefined && isOpen && !isSubLevelRefined) {
      setIsOpen(false)
      refine(item.name)
      return
    }
    setIsOpen(hasSubLevel || !isOpen)
    refine(item.name)
  }, [
    hasSubLevel,
    item.isRefined,
    item.name,
    isOpen,
    isSubLevelRefined,
    refine
  ])

  useEffect(() => {
    setIsOpen(item.isRefined || isSubLevelRefined)
  }, [item.isRefined, isSubLevelRefined])

  return (
    <li
      className={cx(
        `ais-MultiselectHierarchicalMenu-item${hasSubLevel ? "" : "--child"}`,
        isOpen
          ? `ais-MultiselectHierarchicalMenu-item${
              hasSubLevel ? "" : "--child"
            }--selected`
          : ""
      )}
    >
      <label
        className={`ais-MultiselectHierarchicalMenu-label${
          hasSubLevel ? "" : "--child"
        }`}
      >
        {hasSubLevel ? (
          <button
            onClick={onButtonClick}
            className={`ais-MultiselectHierarchicalMenu-toggle${
              hasSubLevel ? "" : "--child"
            }`}
          >
            {isOpen ? "-" : "+"}
          </button>
        ) : (
          <input
            type="checkbox"
            checked={item.isRefined}
            onChange={onLabelClick}
            className={`ais-MultiselectHierarchicalMenu-checkbox${
              hasSubLevel ? "" : "--child"
            }`}
          ></input>
        )}
        <span
          className={`ais-MultiselectHierarchicalMenu-label${
            hasSubLevel ? "" : "--child"
          }`}
        >
          {item.label}
        </span>
        {!hasSubLevel && ( // Only render count if it's child
          <span
            className={`ais-MultiselectHierarchicalMenu-count--child
            }`}
          >
            {item.count}
          </span>
        )}
      </label>
      {hasSubLevel && isOpen && (
        <MultiselectHierarchicalMenuList
          levels={levels}
          index={index + 1}
          item={item}
        />
      )}
    </li>
  )
}

const MultiselectHierarchicalMenuList = ({
  levels,
  index = 0,
  item
}: MultiselectHierarchicalMenuElementProps): JSX.Element => {
  const levelItems = useMemo(
    () =>
      levels[index].items.filter(
        levelItem => !item || levelItem.name.startsWith(item.name)
      ),
    [levels, index, item]
  )

  return (
    <ul
      className={`ais-MultiselectHierarchicalMenu-list${
        index == 0 ? "" : "--child"
      }`}
    >
      {levelItems.map(levelItem => (
        <MultiselectHierarchicalMenuItem
          key={levelItem.name}
          levels={levels}
          index={index}
          item={levelItem}
        />
      ))}
    </ul>
  )
}

export const MultiselectHierarchicalMenu = ({
  attributes,
  separator = " > "
}: MultiselectHierarchicalMenuParams): JSX.Element => {
  const { levels } = useMultiselectHierarchicalMenu({ attributes, separator })

  return (
    <div className="ais-MultiselectHierarchicalMenu">
      {levels.length > 0 && <MultiselectHierarchicalMenuList levels={levels} />}
    </div>
  )
}
