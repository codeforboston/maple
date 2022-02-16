import { useEffect, useMemo, useState } from "react"
import { getBill, listBills } from "./operations"
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

export function useBill(id: string) {
  const [bill, setBill] = useState<Bill | undefined>(undefined)

  useEffect(() => {
    const fetchBill = async () => {
      if (bill?.BillNumber !== id) {
        const fetched = await getBill(id)
        setBill(fetched)
      }
    }
    fetchBill()
  }, [bill, id])

  return useMemo(
    () => ({
      bill,
      loading: bill === undefined
    }),
    [bill]
  )
}
