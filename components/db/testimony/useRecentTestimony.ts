import { usePublishedTestimonyListing } from "./usePublishedTestimonyListing"

export function useRecentTestimony() {
  const { items } = usePublishedTestimonyListing({})

  return items.status === "success" ? items.result : []
}
