import React, { useState } from "react"
import styled from "styled-components"

const StyledMenu = styled.div`
  font-family: "Nunito";

  .category {
    cursor: pointer;
    font-size: 1rem;
    font-weight: bold;
    margin: 8px 0;
    padding: 8px;
    background-color: white;
    border-radius: 4px;
    border-bottom: dashed 1px;
    display: flex;
    align-items: center;
  }

  .category:hover {
    background-color: #f5f5f5;
  }

  .category--expanded::before {
    content: "-";
    margin-right: 10px;
    font-size: 20px;
    color: var(--bs-blue);
  }

  .category--collapsed::before {
    content: "+";
    margin-right: 10px;
    font-size: 20px;
    color: var(--bs-blue);
  }

  .child-list {
    padding-left: 1rem;
    margin-top: 8px;
    list-style-type: none;
    background-color: white;
    border-radius: 4px;
    padding: 1rem;
    border: 1px solid #ddd;
  }

  .child-item {
    margin: 4px 0;
    display: flex;
    align-items: center;
    font-size: 1rem;
    cursor: pointer;
  }

  .child-item input {
    margin-right: 8px;
  }

  .child-item:hover {
    background-color: #f9f9f9;
    border-radius: 4px;
    padding: 4px;
  }

  .child-item--selected {
    font-weight: bold;
    color: var(--bs-blue);
  }
`

export interface HierarchicalItem {
  id: string
  label: string
  items: { value: string; label: string; isSelected?: boolean }[]
}

interface HierarchicalMenuWidgetProps {
  categories: HierarchicalItem[]
  onSelectionChange?: (
    categoryId: string,
    selectedItems: { value: string; label: string }[]
  ) => void
}

const HierarchicalMenuWidget: React.FC<HierarchicalMenuWidgetProps> = ({
  categories,
  onSelectionChange
}) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev =>
      prev.includes(id) ? prev.filter(catId => catId !== id) : [...prev, id]
    )
  }

  const handleChildSelection = (
    categoryId: string,
    selectedItem: { value: string; label: string },
    isSelected: boolean
  ) => {
    if (onSelectionChange) {
      const updatedItem = { ...selectedItem, isSelected }
      onSelectionChange(categoryId, [updatedItem])
    }
  }

  return (
    <StyledMenu>
      {categories.map(category => (
        <div key={category.id}>
          {/* Category */}
          <div
            className={`category ${
              expandedCategories.includes(category.id)
                ? "category--expanded"
                : "category--collapsed"
            }`}
            onClick={() => toggleCategory(category.id)}
          >
            {category.label}
          </div>

          {/* Child Items */}
          {expandedCategories.includes(category.id) && (
            <ul className="child-list">
              {category.items.map(item => (
                <li
                  key={item.value}
                  className={`child-item ${
                    item.isSelected ? "child-item--selected" : ""
                  }`}
                  onClick={() =>
                    handleChildSelection(category.id, item, !item.isSelected)
                  }
                >
                  <input
                    type="checkbox"
                    checked={item.isSelected || false}
                    onChange={e =>
                      e.stopPropagation()
                    } /* Prevent click propagation */
                  />
                  {item.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </StyledMenu>
  )
}

export default HierarchicalMenuWidget
