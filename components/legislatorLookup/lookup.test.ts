import { districtId } from "functions/src/districts/normalize"
import type { MemberSearchIndex } from "../db"
import names from "./districtNames.fixture.json"
import {
  CLEAR_LEAD,
  CONFIDENT_SCORE,
  decideCandidate,
  DistrictsNotFoundError,
  lookUpLegislators,
  seatFor
} from "./lookup"
import {
  AddressCandidate,
  findDistricts,
  geocodeAddress,
  GEOCODER_URL,
  HOUSE_DISTRICTS_URL,
  LookupUnavailableError,
  SENATE_DISTRICTS_URL
} from "./massgis"

/** A candidate as the geocoder returns it; the place fields come from the
 * address unless given. */
const candidate = (
  address: string,
  score: number,
  addressType = "PointAddress",
  place: { city?: string; municipality?: string } = {}
): AddressCandidate => {
  const [, city = "", , zip = ""] = address.split(", ")
  return {
    address,
    score,
    addressType,
    city: place.city ?? city,
    municipality: place.municipality ?? place.city ?? city,
    zip,
    latitude: 42.3,
    longitude: -71.1
  }
}

const index: MemberSearchIndex = {
  representatives: [
    {
      MemberCode: "R1",
      Name: "Pat Example",
      District: "8th Suffolk",
      EmailAddress: "pat@example.org",
      Party: "Democrat",
      Branch: "House"
    },
    {
      MemberCode: "R2",
      Name: "Sam Sample",
      District: "Barnstable, Dukes and Nantucket",
      EmailAddress: "sam@example.org",
      Party: "Democrat",
      Branch: "House"
    }
  ],
  senators: [
    {
      MemberCode: "S1",
      Name: "Lee Placeholder",
      District: "Third Suffolk",
      EmailAddress: "lee@example.org",
      Party: "Democrat",
      Branch: "Senate"
    }
  ]
}

/** A fetch that answers from a function of the request URL. */
function fakeFetch(answer: (url: URL) => unknown) {
  return jest.fn(async (input: RequestInfo | URL) => {
    const body = answer(new URL(String(input)))
    if (body instanceof Error) throw body
    if (typeof body === "number") {
      return { ok: false, status: body, json: async () => ({}) } as Response
    }
    return { ok: true, status: 200, json: async () => body } as Response
  })
}

const districtLayers =
  (house: string | null, senate: string | null) => (url: URL) => {
    const base = `${url.origin}${url.pathname}`
    if (base === HOUSE_DISTRICTS_URL)
      return { features: house ? [{ attributes: { REP_DIST: house } }] : [] }
    if (base === SENATE_DISTRICTS_URL)
      return { features: senate ? [{ attributes: { SEN_DIST: senate } }] : [] }
    throw new Error(`unexpected request ${url}`)
  }

describe("decideCandidate", () => {
  it("takes a single exact match", () => {
    const top = candidate("10 EXAMPLE ST, BOSTON, MA, 02108", 100)
    expect(decideCandidate([top], "10 Example St, Boston")).toEqual({
      kind: "match",
      candidate: top
    })
  })

  it("takes the exact match over near misses on the same street", () => {
    const exact = candidate("36 COURT ST, SPRINGFIELD, MA, 01103", 100)
    const near = candidate("36 E COURT ST, SPRINGFIELD, MA, 01103", 99.32)
    expect(decideCandidate([exact, near], "36 Court St, Springfield")).toEqual({
      kind: "match",
      candidate: exact
    })
  })

  it("takes a match whose ZIP code disagreed, ignoring street-only matches", () => {
    const top = candidate("10 EXAMPLE ST, BOSTON, MA, 02108", 99.49)
    const street = candidate(
      "EXAMPLE ST, BOSTON, MA, 02133",
      96.96,
      "StreetName"
    )
    expect(
      decideCandidate([top, street], "10 Example St, Boston, MA 02133")
    ).toEqual({ kind: "match", candidate: top })
  })

  it("prefers the town typed over towns in the county of the same name", () => {
    // The geocoder scores "Worcester" as matching all of Worcester County
    const elsewhere = ["BOLTON", "FITCHBURG", "LEICESTER", "OXFORD"].map(town =>
      candidate(`455 MAIN STREET, ${town}, MA, 01000`, 100)
    )
    const worcester = candidate(
      "455 MAIN ST, WORCESTER, MA, 01608",
      100,
      "StreetAddress"
    )
    expect(
      decideCandidate([...elsewhere, worcester], "455 Main St, Worcester")
    ).toEqual({ kind: "match", candidate: worcester })
  })

  it("counts a Boston neighborhood as Boston", () => {
    const charlestown = candidate(
      "100 WARREN ST, CHARLESTOWN, MA, 02129",
      97.26,
      "PointAddress",
      { municipality: "BOSTON" }
    )
    const roxbury = candidate(
      "100 WARREN ST, ROXBURY, MA, 02119",
      97.26,
      "PointAddress",
      { municipality: "BOSTON" }
    )
    const avenue = candidate("100 WARREN AVE, BOSTON, MA, 02116", 97.01)
    const town = candidate("100 WARREN ST, WARREN, MA, 01083", 97.26)
    const all = [charlestown, roxbury, avenue, town]
    expect(decideCandidate(all, "100 Warren St, Boston")).toEqual({
      kind: "choose",
      candidates: [charlestown, roxbury, avenue]
    })
    expect(decideCandidate(all, "100 Warren St, Roxbury")).toEqual({
      kind: "choose",
      candidates: [roxbury]
    })
  })

  it("prefers the ZIP code typed over any place name", () => {
    const charlestown = candidate(
      "100 WARREN ST, CHARLESTOWN, MA, 02129",
      97.26,
      "PointAddress",
      { municipality: "BOSTON" }
    )
    const roxbury = candidate(
      "100 WARREN ST, ROXBURY, MA, 02119",
      97.26,
      "PointAddress",
      { municipality: "BOSTON" }
    )
    expect(
      decideCandidate([charlestown, roxbury], "100 Warren St, Boston 02119")
    ).toEqual({ kind: "choose", candidates: [roxbury] })
  })

  it("prefers the longer place name typed", () => {
    const west = candidate(
      "10 CENTRE ST, WEST ROXBURY, MA, 02132",
      100,
      "PointAddress",
      { municipality: "BOSTON" }
    )
    const rox = candidate(
      "10 CENTRE ST, ROXBURY, MA, 02119",
      100,
      "PointAddress",
      { municipality: "BOSTON" }
    )
    expect(
      decideCandidate([rox, west], "10 Centre Street, West Roxbury")
    ).toEqual({ kind: "match", candidate: west })
  })

  it("doesn't read a street named for a town as the town", () => {
    const waltham = candidate("10 LEXINGTON ST, WALTHAM, MA, 02452", 100)
    const lexington = candidate("10 LEXINGTON ST, LEXINGTON, MA, 02420", 100)
    expect(
      decideCandidate([lexington, waltham], "10 Lexington St Waltham")
    ).toEqual({ kind: "match", candidate: waltham })
  })

  it("asks when exact matches are in different towns and no town was typed", () => {
    const a = candidate("1 SAMPLE ST, BOSTON, MA, 02108", 100)
    const b = candidate("1 SAMPLE ST, BROOKLINE, MA, 02446", 100)
    expect(decideCandidate([a, b], "1 Sample St")).toEqual({
      kind: "choose",
      candidates: [a, b]
    })
  })

  it("asks for the town when the address is in too many to list", () => {
    const towns = ["A", "B", "C", "D", "E", "F"].map(t =>
      candidate(`1 SAMPLE ST, TOWN ${t}, MA, 01000`, 100)
    )
    expect(decideCandidate(towns, "1 Sample St")).toEqual({
      kind: "needsTown"
    })
  })

  it("asks when the only match isn't quite what was typed", () => {
    // e.g. typed one town, matched the same street in the next town
    const guess = candidate("12 EXAMPLE RD, NEXTTOWN, MA, 01803", 97.26)
    expect(decideCandidate([guess], "12 Example Rd, Thistown")).toEqual({
      kind: "choose",
      candidates: [guess]
    })
    expect(guess.score).toBeLessThan(CONFIDENT_SCORE)
  })

  it("asks when two inexact matches are close", () => {
    const a = candidate("10 EXAMPLE ST, BOSTON, MA, 02108", 99.4)
    const b = candidate(
      "10 EXAMPLE AVE, BOSTON, MA, 02116",
      99.4 - CLEAR_LEAD / 2
    )
    expect(decideCandidate([a, b], "10 Example, Boston").kind).toBe("choose")
  })

  it("merges one address placed twice, keeping the building and the best score", () => {
    const building = candidate("1 ADAMS STREET, MILTON, MA, 02186", 97.26)
    const street = {
      ...candidate("1 ADAMS ST, MILTON, MA, 02186", 97.5, "StreetAddress"),
      latitude: 1
    }
    expect(decideCandidate([building, street], "1 Adams St, Milton")).toEqual({
      kind: "choose",
      candidates: [{ ...building, score: 97.5 }]
    })
  })

  it("asks for a house number when only a street or town matched", () => {
    expect(
      decideCandidate(
        [
          candidate("EXAMPLE ST, BOSTON, MA, 02215", 100, "StreetName"),
          candidate("BOSTON, MA", 100, "Locality")
        ],
        "Example St, Boston"
      )
    ).toEqual({ kind: "needsHouseNumber" })
  })

  it("reports nothing found for no matches or weak ones", () => {
    expect(decideCandidate([], "1 Elsewhere Ave")).toEqual({
      kind: "notFound"
    })
    expect(
      decideCandidate([candidate("1 ELSEWHERE AVE", 60)], "1 Elsewhere Ave")
    ).toEqual({ kind: "notFound" })
  })
})

describe("seatFor", () => {
  it("finds the member for a district however its name is written", () => {
    expect(seatFor("House", "8th Suffolk", index.representatives)).toEqual({
      district: "8th Suffolk",
      member: { id: "R1", district: "8th Suffolk", name: "Pat Example" }
    })
    expect(
      seatFor("House", "Barnstable, Dukes & Nantucket", index.representatives)
        .member?.id
    ).toBe("R2")
    expect(seatFor("Senate", "3rd Suffolk", index.senators).member?.id).toBe(
      "S1"
    )
  })

  it("returns no member for a vacant seat", () => {
    expect(seatFor("House", "1st Franklin", index.representatives)).toEqual({
      district: "1st Franklin",
      member: null
    })
  })
})

describe("district names", () => {
  // MassGIS's layers and the legislature's member records must name the 200
  // districts the same way, or a seat would come back empty.
  it.each(["House", "Senate"] as const)(
    "match one to one between MassGIS and the legislature (%s)",
    branch => {
      const massgis = names.massgis[branch].map(d => districtId(branch, d))
      const legislature = names.legislature[branch].map(d =>
        districtId(branch, d)
      )
      expect(new Set(massgis).size).toBe(massgis.length)
      expect(massgis.length).toBe(branch === "House" ? 160 : 40)
      expect([...massgis].sort()).toEqual([...legislature].sort())
    }
  )
})

describe("geocodeAddress", () => {
  it("asks the MassGIS geocoder and reads its candidates", async () => {
    const fetch = fakeFetch(url => {
      expect(`${url.origin}${url.pathname}`).toBe(GEOCODER_URL)
      expect(url.searchParams.get("SingleLine")).toBe("10 Example St, Boston")
      expect(url.searchParams.get("outSR")).toBe("4326")
      return {
        candidates: [
          {
            address: "10 EXAMPLE ST, BOSTON, MA, 02108",
            score: 100,
            location: { x: -71.06, y: 42.36 },
            attributes: {
              Addr_type: "PointAddress",
              City: "BOSTON",
              MUNICIPALITY: "BOSTON",
              Postal: "02108"
            }
          },
          { address: "malformed" }
        ]
      }
    })
    await expect(
      geocodeAddress("10 Example St, Boston", fetch)
    ).resolves.toEqual([
      {
        address: "10 EXAMPLE ST, BOSTON, MA, 02108",
        score: 100,
        addressType: "PointAddress",
        city: "BOSTON",
        municipality: "BOSTON",
        zip: "02108",
        latitude: 42.36,
        longitude: -71.06
      }
    ])
  })

  it.each([
    ["an ArcGIS error", { error: { code: 500, message: "boom" } }],
    ["an HTTP error", 502],
    ["a network failure", new TypeError("Failed to fetch")]
  ])("reports %s as unavailable", async (_, answer) => {
    await expect(
      geocodeAddress(
        "x",
        fakeFetch(() => answer)
      )
    ).rejects.toBeInstanceOf(LookupUnavailableError)
  })
})

describe("findDistricts", () => {
  it("queries both district layers at the point", async () => {
    const fetch = fakeFetch(url => {
      expect(url.searchParams.get("geometry")).toBe("-71.06,42.36")
      expect(url.searchParams.get("inSR")).toBe("4326")
      return districtLayers("8th Suffolk", "Third Suffolk")(url)
    })
    await expect(
      findDistricts({ latitude: 42.36, longitude: -71.06 }, fetch)
    ).resolves.toEqual({ house: "8th Suffolk", senate: "Third Suffolk" })
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})

describe("lookUpLegislators", () => {
  const home = candidate("10 EXAMPLE ST, BOSTON, MA, 02108", 100)

  it("returns the sitting members for the address's districts", async () => {
    await expect(
      lookUpLegislators(
        home,
        index,
        fakeFetch(districtLayers("8th Suffolk", "Third Suffolk"))
      )
    ).resolves.toEqual({
      address: home.address,
      representative: {
        district: "8th Suffolk",
        member: { id: "R1", district: "8th Suffolk", name: "Pat Example" }
      },
      senator: {
        district: "Third Suffolk",
        member: { id: "S1", district: "Third Suffolk", name: "Lee Placeholder" }
      }
    })
  })

  it("leaves a vacant seat empty", async () => {
    const result = await lookUpLegislators(
      home,
      index,
      fakeFetch(districtLayers("1st Franklin", "Third Suffolk"))
    )
    expect(result.representative).toEqual({
      district: "1st Franklin",
      member: null
    })
  })

  it("fails for a point outside the district maps", async () => {
    await expect(
      lookUpLegislators(home, index, fakeFetch(districtLayers(null, null)))
    ).rejects.toBeInstanceOf(DistrictsNotFoundError)
  })
})
