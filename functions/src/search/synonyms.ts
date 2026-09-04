/** The curated legislative synonym set, referenced by name from every search's
 * `synonym_sets` param (components/search/searchParams.ts imports the name).
 *
 * It is server state that no collection carries, so `checkSearchIndexVersion`
 * re-upserts it on every deploy — the same trigger that keeps the collections
 * current. See docs/search-deployment.md for how a missing set fails.
 */
import type { Client } from "typesense"
import type { SynonymItemSchema } from "typesense/lib/Typesense/SynonymSets"

export const SYNONYM_SET_NAME = "legislative"

/** A multi-way set expands every member to every other member. The head term
 * is the id and always a member, so the set cannot omit it (#90). */
const multiWay = (head: string, ...rest: string[]): SynonymItemSchema => ({
  id: head,
  synonyms: [head, ...rest]
})

/** A one-way set matches `root` on the query side only; keeping the root out
 * of `synonyms` is what keeps it one-way. */
const oneWay = (root: string, ...synonyms: string[]): SynonymItemSchema => ({
  id: root.replace(/\s+/g, "-"),
  root,
  synonyms
})

export const legislativeSynonymItems: SynonymItemSchema[] = [
  multiWay("firearms", "firearm", "gun", "guns"),
  multiWay("educators", "educator", "teacher", "teachers"),
  multiWay("cannabis", "marijuana", "marihuana"),
  oneWay("doctor", "physician"),
  oneWay("doctors", "physicians", "physician"),
  ...["senior citizens", "seniors", "elders", "older adults"].map(root =>
    oneWay(root, "elderly")
  ),
  multiWay("alcohol", "liquor", "alcoholic beverages", "alcoholic beverage"),
  ...["child care", "daycare", "day care"].map(root =>
    oneWay(root, "childcare")
  ),
  oneWay("healthcare", "health care"),
  multiWay(
    "oui",
    "dui",
    "dwi",
    "drunk driving",
    "operating under the influence"
  ),
  multiWay("mbta", "massachusetts bay transportation authority"),
  oneWay("public transit", "mbta"),
  ...["servicemember", "service member"].map(root =>
    oneWay(root, "veteran", "veterans")
  ),
  multiWay("climate", "climate change", "global warming"),
  multiWay("tenants", "tenant", "renter", "renters"),
  multiWay("police", "law enforcement"),
  multiWay(
    "vehicles",
    "vehicle",
    "car",
    "cars",
    "automobile",
    "automobiles",
    "motor vehicle",
    "motor vehicles"
  ),
  multiWay("children", "child", "kids"),
  oneWay("opiate", "opioid"),
  oneWay("opiates", "opioids", "opioid"),
  multiWay("incarceration", "prison", "prisons", "correctional facility"),
  multiWay("disability", "disabled", "disabilities"),
  oneWay("clean energy", "renewable energy")
]

export async function upsertLegislativeSynonyms(client: Client) {
  await client
    .synonymSets(SYNONYM_SET_NAME)
    .upsert({ items: legislativeSynonymItems })
  return { name: SYNONYM_SET_NAME, items: legislativeSynonymItems.length }
}
