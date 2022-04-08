import { usePublishedTestimonyListing } from "./usePublishedTestimonyListing"

export function useRecentTestimony() {
  const { result, status } = usePublishedTestimonyListing({})

  return status === "success" ? result : []
}
