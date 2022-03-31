import { usePublishedTestimonyListing } from "./usePublishedTestimonyListing"

export function useRecentTestimony() {
  const { result, loading, status } = usePublishedTestimonyListing({})

  return {
    recentTestimony: status === "success" ? result : [],
    loading
  }
}
