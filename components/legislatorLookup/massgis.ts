/**
 * Requests to MassGIS, the state's mapping office, which publishes both an
 * address geocoder built on its statewide address points and the official
 * 2021 House and Senate district maps. Both services allow requests from any
 * site, so the browser calls them directly and the address a user types is
 * never sent to MAPLE's own servers.
 *
 * Geocoder: https://www.mass.gov/info-details/massgis-data-master-address-data-statewide-address-points-for-geocoding
 * Districts: https://www.mass.gov/info-details/massgis-data-massachusetts-house-legislative-districts-2021
 * and https://www.mass.gov/info-details/massgis-data-massachusetts-senate-legislative-districts-2021
 */

const MASSGIS =
  "https://arcgisserver.digital.mass.gov/arcgisserver/rest/services"

export const GEOCODER_URL = `${MASSGIS}/MassGISStatewideGeocodeService/GeocodeServer/findAddressCandidates`
/** Layer 1 of each service holds the district polygons (layer 0 is outlines). */
export const HOUSE_DISTRICTS_URL = `${MASSGIS}/AGOL/House2021/FeatureServer/1/query`
export const SENATE_DISTRICTS_URL = `${MASSGIS}/AGOL/Senate2021/FeatureServer/1/query`

const TIMEOUT_MS = 10_000

export type AddressCandidate = {
  /** The address as the geocoder matched it, e.g. "24 BEACON ST, BOSTON, MA, 02108" */
  address: string
  /** 0–100; 100 is an exact match */
  score: number
  /** PointAddress (a building), StreetAddress (placed along a street),
   * StreetName (no house number), Locality, Postal, … */
  addressType: string
  /** The place name in the address: a town, or a Boston neighborhood or a
   * village such as Hyannis */
  city: string
  /** The city or town the address is in, e.g. BOSTON for a Roxbury address */
  municipality: string
  zip: string
  latitude: number
  longitude: number
}

export type DistrictNames = {
  /** e.g. "8th Suffolk", or null if the point is in no House district */
  house: string | null
  /** e.g. "Third Suffolk", or null if the point is in no Senate district */
  senate: string | null
}

/** MassGIS did not answer, or answered with an error. */
export class LookupUnavailableError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = "LookupUnavailableError"
  }
}

type Fetch = typeof fetch

async function getJson(
  url: string,
  params: Record<string, string>,
  fetchImpl: Fetch
): Promise<any> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const response = await fetchImpl(
      `${url}?${new URLSearchParams(params).toString()}`,
      { signal: controller.signal }
    )
    if (!response.ok) {
      throw new LookupUnavailableError(`MassGIS responded ${response.status}`)
    }
    const body = await response.json()
    // ArcGIS reports most failures as a 200 with an error object
    if (body?.error) {
      throw new LookupUnavailableError(
        `MassGIS error: ${body.error.message ?? body.error.code}`
      )
    }
    return body
  } catch (e) {
    if (e instanceof LookupUnavailableError) throw e
    throw new LookupUnavailableError("MassGIS request failed", { cause: e })
  } finally {
    clearTimeout(timer)
  }
}

/** Possible matches for a free-text address, best first. Massachusetts only. */
export async function geocodeAddress(
  address: string,
  fetchImpl: Fetch = fetch
): Promise<AddressCandidate[]> {
  const body = await getJson(
    GEOCODER_URL,
    {
      SingleLine: address,
      outFields: "Addr_type,City,MUNICIPALITY,Postal",
      // A town that shares its county's name (Worcester, Plymouth, …) also
      // matches every town in the county, at the same score, so ask for
      // enough candidates that the town itself is among them.
      maxLocations: "50",
      outSR: "4326",
      f: "json"
    },
    fetchImpl
  )

  const candidates: any[] = Array.isArray(body?.candidates)
    ? body.candidates
    : []
  return candidates
    .filter(
      c =>
        typeof c?.address === "string" &&
        typeof c?.score === "number" &&
        typeof c?.location?.x === "number" &&
        typeof c?.location?.y === "number"
    )
    .map(c => ({
      address: c.address,
      score: c.score,
      addressType: String(c.attributes?.Addr_type ?? ""),
      city: String(c.attributes?.City ?? ""),
      municipality: String(c.attributes?.MUNICIPALITY ?? ""),
      zip: String(c.attributes?.Postal ?? ""),
      latitude: c.location.y,
      longitude: c.location.x
    }))
}

function districtAt(
  url: string,
  field: string,
  point: { latitude: number; longitude: number },
  fetchImpl: Fetch
): Promise<string | null> {
  return getJson(
    url,
    {
      geometry: `${point.longitude},${point.latitude}`,
      geometryType: "esriGeometryPoint",
      inSR: "4326",
      spatialRel: "esriSpatialRelIntersects",
      outFields: field,
      returnGeometry: "false",
      f: "json"
    },
    fetchImpl
  ).then(body => {
    const name = body?.features?.[0]?.attributes?.[field]
    return typeof name === "string" && name.trim() ? name.trim() : null
  })
}

/** The House and Senate districts that contain a point. Only the district
 * names are read: the layers also carry legislators' names, but those are
 * updated by hand after elections and lag behind, so members come from
 * MAPLE's own records instead (see lookup.ts). */
export async function findDistricts(
  point: { latitude: number; longitude: number },
  fetchImpl: Fetch = fetch
): Promise<DistrictNames> {
  const [house, senate] = await Promise.all([
    districtAt(HOUSE_DISTRICTS_URL, "REP_DIST", point, fetchImpl),
    districtAt(SENATE_DISTRICTS_URL, "SEN_DIST", point, fetchImpl)
  ])
  return { house, senate }
}
