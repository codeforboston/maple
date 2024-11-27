import React from "react"
import { HierarchicalMenu } from "react-instantsearch"
import HierarchicalMenuToggler from "./HierarchicalMenuToggler"

const SearchableHierarchicalMenu = ({
  attributes
}: {
  attributes: string[]
}) => {
  return (
    <div>
      {/* Toggle behavior */}
      <HierarchicalMenuToggler />

      {/* Algolia HierarchicalMenu */}
      <HierarchicalMenu attributes={attributes} />
    </div>
  )
}

export default SearchableHierarchicalMenu
