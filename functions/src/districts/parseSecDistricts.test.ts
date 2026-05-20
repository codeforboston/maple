import {
  displayDistrictName,
  districtId,
  normalizeDistrictName
} from "./normalize"
import { parseSecDistricts } from "./parseSecDistricts"

const sourceUrl = "https://example.test/districts"

describe("district normalization", () => {
  it("normalizes district names across ordinal and punctuation variants", () => {
    expect(normalizeDistrictName("Ninth Hampden")).toBe("9 hampden")
    expect(normalizeDistrictName("9th Hampden")).toBe("9 hampden")
    expect(normalizeDistrictName("Thirty-Seventh Middlesex")).toBe(
      "37 middlesex"
    )
    expect(
      normalizeDistrictName("Berkshire, Hampden, Franklin, and Hampshire")
    ).toBe("berkshire hampden franklin hampshire")
  })

  it("builds firestore-safe district ids with the branch", () => {
    expect(districtId("House", "9th Hampden")).toBe("house-9-hampden")
    expect(districtId("Senate", "Third Bristol and Plymouth")).toBe(
      "senate-3-bristol-plymouth"
    )
  })

  it("converts House source headings to member-facing ordinal names", () => {
    expect(displayDistrictName("Ninth Hampden")).toBe("9th Hampden")
    expect(displayDistrictName("Thirty-Seventh Middlesex")).toBe(
      "37th Middlesex"
    )
    expect(displayDistrictName("Barnstable, Dukes, and Nantucket")).toBe(
      "Barnstable, Dukes, and Nantucket"
    )
  })
})

describe("parseSecDistricts", () => {
  it("parses Senate h2 district sections and preserves split municipalities", () => {
    const html = `
      <h1>Massachusetts Senatorial Districts</h1>
      <h2>Third Bristol and Plymouth</h2>
      <ul>
        <li>Berkley</li>
        <li>Taunton:<br>Ward 1 Precincts A, B;<br>Ward 2;</li>
      </ul>
      <hr>
      <h2>Plymouth and Barnstable</h2>
      <ul>
        <li>Bourne</li>
        <li>Falmouth</li>
      </ul>
    `

    expect(parseSecDistricts(html, { branch: "Senate", sourceUrl })).toEqual([
      {
        id: "senate-3-bristol-plymouth",
        branch: "Senate",
        district: "Third Bristol and Plymouth",
        sourceDistrict: "Third Bristol and Plymouth",
        sourceUrl,
        municipalities: [
          { name: "Berkley", subdivisions: [] },
          {
            name: "Taunton",
            subdivisions: ["Ward 1 Precincts A, B", "Ward 2"]
          }
        ]
      },
      {
        id: "senate-plymouth-barnstable",
        branch: "Senate",
        district: "Plymouth and Barnstable",
        sourceDistrict: "Plymouth and Barnstable",
        sourceUrl,
        municipalities: [
          { name: "Bourne", subdivisions: [] },
          { name: "Falmouth", subdivisions: [] }
        ]
      }
    ])
  })

  it("parses House county h2 wrappers, district h3s, and cross-county h2 districts", () => {
    const html = `
      <h1>Massachusetts Representative Districts</h1>
      <h2>Barnstable County</h2>
      <h3>First Barnstable</h3>
      <ul>
        <li>Brewster</li>
        <li>Yarmouth:<br>Precincts 1, 2, 3;</li>
      </ul>
      <hr>
      <h2>Barnstable, Dukes, and Nantucket</h2>
      <ul>
        <li>Aquinnah</li>
        <li>Falmouth:<br>Precincts 1, 2, 6;</li>
      </ul>
      <h2>Middlesex County</h2>
      <h3>Thirty-Seventh Middlesex</h3>
      <ul>
        <li>Acton:<br>Precinct 6A;</li>
      </ul>
    `

    expect(parseSecDistricts(html, { branch: "House", sourceUrl })).toEqual([
      {
        id: "house-1-barnstable",
        branch: "House",
        district: "1st Barnstable",
        sourceDistrict: "First Barnstable",
        sourceUrl,
        municipalities: [
          { name: "Brewster", subdivisions: [] },
          { name: "Yarmouth", subdivisions: ["Precincts 1, 2, 3"] }
        ]
      },
      {
        id: "house-barnstable-dukes-nantucket",
        branch: "House",
        district: "Barnstable, Dukes, and Nantucket",
        sourceDistrict: "Barnstable, Dukes, and Nantucket",
        sourceUrl,
        municipalities: [
          { name: "Aquinnah", subdivisions: [] },
          { name: "Falmouth", subdivisions: ["Precincts 1, 2, 6"] }
        ]
      },
      {
        id: "house-37-middlesex",
        branch: "House",
        district: "37th Middlesex",
        sourceDistrict: "Thirty-Seventh Middlesex",
        sourceUrl,
        municipalities: [{ name: "Acton", subdivisions: ["Precinct 6A"] }]
      }
    ])
  })
})
