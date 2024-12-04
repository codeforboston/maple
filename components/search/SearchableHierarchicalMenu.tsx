import React, { useState } from "react"
import { HierarchicalMenu, HierarchicalMenuProps } from "react-instantsearch"

type Props = {
  attributes: string[]
}

const SearchableHierarchicalMenu: React.FC<Props> = ({ attributes }) => {
  const [searchQuery, setSearchQuery] = useState("")

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  const filterAndTransformItems = (items: any[]) =>
    items
      .filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map(item => ({
        ...item,
        label: item.label.toUpperCase()
      }))
  const transformItems: HierarchicalMenuProps["transformItems"] = items => {
    if (!items) {
      console.error("transformItems received null or undefined items")
      return []
    }
    return items.map(item => ({
      ...item,
      label: item.label
    }))
  }
  return (
    <div>
      {/* Custom Search Input */}
      {/* <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={handleInputChange}
        style={{
          padding: "8px",
          marginBottom: "16px",
          width: "100%",
          boxSizing: "border-box"
        }}
      /> */}

      {/* HierarchicalMenu with filter and transform logic */}
      <HierarchicalMenu
        attributes={attributes}
        transformItems={transformItems}
      />
    </div>
  )
}

export default SearchableHierarchicalMenu
