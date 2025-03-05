import { useHierarchicalMenu } from "../useHierarchicalMenu"

export const useBillHierarchicalMenu = () => {
  const baseProps = { limit: 500, searchable: true }
  const propsList = [
    {
      attribute: "topics.lvl0",
      ...baseProps
    },
    {
      attribute: "topics.lvl1",
      ...baseProps
    }
  ]

  return useHierarchicalMenu({ hierarchicalMenuProps: propsList })
}
