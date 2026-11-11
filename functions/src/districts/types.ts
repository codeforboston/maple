import { Array as RtArray, InstanceOf, Record, Static, String } from "runtypes"
import { Branch } from "../common"
import { Timestamp } from "../firebase"

export const DistrictMunicipality = Record({
  name: String,
  subdivisions: RtArray(String)
})
export type DistrictMunicipality = Static<typeof DistrictMunicipality>

export const District = Record({
  id: String,
  branch: Branch,
  district: String,
  sourceDistrict: String,
  sourceUrl: String,
  municipalities: RtArray(DistrictMunicipality),
  fetchedAt: InstanceOf(Timestamp)
})
export type District = Static<typeof District>

export type ParsedDistrict = Omit<District, "fetchedAt">
