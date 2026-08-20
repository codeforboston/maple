import { JSDOM } from "jsdom"
import { compact } from "lodash"
import { districtId, displayDistrictName } from "./normalize"
import type { DistrictBranch, ParsedDistrict } from "./types"

type ParseOptions = {
  branch: DistrictBranch
  sourceUrl: string
}

function cleanText(text: string) {
  return text
    .replace(/\u00a0/g, " ")
    .replace(/\s*▲?\s*Top of page\s*/gi, "")
    .replace(/\s+/g, " ")
    .trim()
}

function stripIgnoredTags(html: string) {
  return html.replace(/<style[\s\S]*?<\/style>/gi, "")
}

function isHouseCountyHeading(element: Element) {
  return (
    element.tagName.toLowerCase() === "h2" &&
    / county$/i.test(cleanText(element.textContent ?? ""))
  )
}

function isDistrictHeading(element: Element, branch: DistrictBranch) {
  const tagName = element.tagName.toLowerCase()
  if (branch === "Senate") return tagName === "h2"
  return (
    (tagName === "h2" || tagName === "h3") && !isHouseCountyHeading(element)
  )
}

function followingDistrictItems(heading: Element, branch: DistrictBranch) {
  const items: HTMLLIElement[] = []
  let element = heading.nextElementSibling

  while (element) {
    if (isDistrictHeading(element, branch)) break
    if (branch === "House" && isHouseCountyHeading(element)) break
    items.push(
      ...Array.from(element.querySelectorAll("li")).filter(
        (item): item is HTMLLIElement =>
          item instanceof heading.ownerDocument.defaultView!.HTMLLIElement
      )
    )
    element = element.nextElementSibling
  }

  return items
}

function parseMunicipality(text: string) {
  const [rawName, ...detailParts] = text.split(":")
  const name = cleanText(rawName)
  const details = cleanText(detailParts.join(":"))
  const subdivisions = compact(
    details
      .split(";")
      .map(detail => detail.replace(/[.;]+$/g, ""))
      .map(cleanText)
  )

  return { name, subdivisions }
}

export function parseSecDistricts(
  html: string,
  options: ParseOptions
): ParsedDistrict[] {
  const dom = new JSDOM(stripIgnoredTags(html))
  const document = dom.window.document
  const title = Array.from(document.querySelectorAll("h1")).find(heading =>
    /massachusetts .* districts/i.test(heading.textContent ?? "")
  )
  const headings = Array.from(document.querySelectorAll("h2, h3")).filter(
    heading =>
      (!title ||
        Boolean(
          title.compareDocumentPosition(heading) &
            dom.window.Node.DOCUMENT_POSITION_FOLLOWING
        )) &&
      isDistrictHeading(heading, options.branch)
  )

  return headings.map(heading => {
    const sourceDistrict = cleanText(heading.textContent ?? "")
    const district =
      options.branch === "House"
        ? displayDistrictName(sourceDistrict)
        : sourceDistrict

    return {
      id: districtId(options.branch, district),
      branch: options.branch,
      district,
      sourceDistrict,
      sourceUrl: options.sourceUrl,
      municipalities: followingDistrictItems(heading, options.branch)
        .map(item => parseMunicipality(item.textContent ?? ""))
        .filter(municipality => municipality.name.length > 0)
    }
  })
}
