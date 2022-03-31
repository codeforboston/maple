import { useAsync } from "react-async-hook"
import { listBillsByHearingDate } from "./bills"

export function useUpcomingBills(limit: number = 100) {
  const { result, loading, status } = useAsync(listBillsByHearingDate, [
    null,
    limit,
    null
  ])

  return {
    upcomingBills: status === "success" ? result : [],
    loading
  }
}
