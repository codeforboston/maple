import { Bill, getBill } from "../../db"
import { createAppThunk } from "../../hooks"
import { setBill } from "../redux"

/** Configure the bill for which to provide testimony. */
export const resolveBill = createAppThunk(
  "publish/resolveBill",
  async (info: { billId?: string; bill?: Bill }, { dispatch }) => {
    let bill = info.bill
    if (!bill) {
      if (!info.billId) throw Error("billId or bill required")
      bill = await getBill(info.billId)
      if (!bill) throw Error(`Invalid billId ${info.billId}`)
    }
    dispatch(setBill(bill))
  }
)
