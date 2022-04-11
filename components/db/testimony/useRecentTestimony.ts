import { usePublishedTestimonyListing2 } from "./usePublishedTestimonyListing"

export function useRecentTestimony() {
  const { items } = usePublishedTestimonyListing2({})

  return items.status === "success" ? items.result : []
}
