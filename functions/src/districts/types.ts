import {
  Array as RtArray,
  InstanceOf,
  Literal,
  Record,
  Static,
  String,
  Union
} from "runtypes"
import { Timestamp } from "../firebase"

export const DistrictBranch = Union(Literal("House"), Literal("Senate"))
export type DistrictBranch = Static<typeof DistrictBranch>

export const DistrictMunicipality = Record({
  name: String,
  subdivisions: RtArray(String)
})
export type DistrictMunicipality = Static<typeof DistrictMunicipality>

export const District = Record({
  id: String,
  branch: DistrictBranch,
  district: String,
  sourceDistrict: String,
  sourceUrl: String,
  municipalities: RtArray(DistrictMunicipality),
  fetchedAt: InstanceOf(Timestamp)
})
export type District = Static<typeof District>

export type ParsedDistrict = Omit<District, "fetchedAt">
