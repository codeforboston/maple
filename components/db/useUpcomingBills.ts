import { useAsync } from "react-async-hook"
import { listBillsByHearingDate } from "./bills"

export function useUpcomingBills(limit: number = 100) {
  const { result, status } = useAsync(listBillsByHearingDate, [limit])

  return status === "success" ? result : []
}
