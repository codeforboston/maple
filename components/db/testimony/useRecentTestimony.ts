import { usePublishedTestimonyListing } from "./usePublishedTestimonyListing"

export function useRecentTestimony(limit?: number) {
  const { items } = usePublishedTestimonyListing({})

  return items.status === "success" ? items.result?.slice(0, limit) : []
}
