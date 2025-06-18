import { Array, InstanceOf, Record, Static, String } from "runtypes"
import { Id, NullStr } from "../common"
import { Timestamp } from "../../../common/types"

export type CityListing = Static<typeof CityListing>
export const CityListing = Array(String)

export type CityBill = Static<typeof CityBill>
export const CityBill = Record({
  BillNumber: NullStr
})

export type CityBills = Static<typeof CityBills>
export const CityBills = Array(CityBill)

export type City = Static<typeof City>
export const City = Record({
  id: String,
  bills: Array(Id),
  fetchedAt: InstanceOf(Timestamp)
})
