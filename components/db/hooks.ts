import { useEffect, useMemo, useState } from "react"
import { listBills } from "."
import { Bill } from "./types"

export function useBills() {
  const [bills, setBills] = useState<Bill[] | undefined>(undefined)

  useEffect(() => {
    const fetchBills = async () => {
      if (bills === undefined) {
        const fetched = await listBills(10)
        setBills(fetched)
      }
    }
    fetchBills()
  }, [bills])

  return useMemo(
    () => ({
      bills,
      loading: bills === undefined
    }),
    [bills]
  )
}
