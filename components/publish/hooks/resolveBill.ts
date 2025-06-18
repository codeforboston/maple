import { Bill } from "common/bills/types"
import { getBill } from "../../db"
import { createAppThunk } from "../../hooks"
import { setBill } from "../redux"

/** Configure the bill for which to provide testimony. */
export const resolveBill = createAppThunk(
  "publish/resolveBill",
  async (
    info: { billId?: string; court?: number; bill?: Bill },
    { dispatch }
  ) => {
    let bill = info.bill
    if (!bill) {
      if (!info.billId || !info.court) throw Error("billId or bill required")
      bill = await getBill(info.court, info.billId)
      if (!bill) throw Error(`Invalid billId ${info.billId}`)
    }
    dispatch(setBill(bill))
  }
)
