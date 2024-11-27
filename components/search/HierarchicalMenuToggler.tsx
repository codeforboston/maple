import { useEffect } from "react"

const HierarchicalMenuToggler = () => {
  useEffect(() => {
    // Select all parent items
    const parentItems = document.querySelectorAll<HTMLLIElement>(
      ".ais-HierarchicalMenu-item--parent"
    )

    // Add click listeners to toggle child lists
    parentItems.forEach(parent => {
      const childList = parent.querySelector<HTMLUListElement>(
        ".ais-HierarchicalMenu-list--child"
      )

      const toggleChildList = () => {
        if (childList) {
          if (childList.style.display === "none" || !childList.style.display) {
            // Expand: Show the child list
            childList.style.display = "block"
          } else {
            // Collapse: Hide the child list
            childList.style.display = "none"
          }
        }
      }

      parent.addEventListener("click", toggleChildList)

      // Cleanup: Remove event listener on unmount
      return () => {
        parent.removeEventListener("click", toggleChildList)
      }
    })
  }, [])

  return null
}

export default HierarchicalMenuToggler
