import type { Timestamp } from "firebase/firestore"
import { useMemo } from "react"
import { useAsync } from "react-async-hook"
import { districtId } from "functions/src/districts/normalize"
import { loadDoc } from "./common"

export type DistrictBranch = "House" | "Senate"

export type DistrictMunicipality = {
  name: string
  subdivisions: string[]
}

export type District = {
  id: string
  branch: DistrictBranch
  district: string
  sourceDistrict: string
  sourceUrl: string
  municipalities: DistrictMunicipality[]
  fetchedAt: Timestamp
}

async function getDistrict(
  court: number,
  branch?: string | null,
  district?: string | null
): Promise<District | undefined> {
  if (branch !== "House" && branch !== "Senate") return undefined
  if (!district) return undefined

  return loadDoc(
    `/generalCourts/${court}/districts/${districtId(branch, district)}`
  ) as Promise<District | undefined>
}

export function useDistrict(
  court: number,
  branch?: string | null,
  district?: string | null
) {
  const { loading, result } = useAsync(getDistrict, [court, branch, district])

  return useMemo(
    () => ({
      district: result,
      loading
    }),
    [loading, result]
  )
}
