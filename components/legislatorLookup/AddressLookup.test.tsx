import "@testing-library/jest-dom"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { MemberSearchIndex } from "../db"
import { AddressLookup } from "./AddressLookup"
import {
  GEOCODER_URL,
  HOUSE_DISTRICTS_URL,
  SENATE_DISTRICTS_URL
} from "./massgis"

jest.mock("next-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey
}))

const index: MemberSearchIndex = {
  representatives: [
    {
      MemberCode: "R1",
      Name: "Pat Example",
      District: "8th Suffolk",
      EmailAddress: "pat@example.org",
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

let geocoderCandidates: unknown[] = []
let geocoderDown = false

beforeEach(() => {
  geocoderDown = false
  global.fetch = jest.fn(async (input: RequestInfo | URL) => {
    const url = new URL(String(input))
    const base = `${url.origin}${url.pathname}`
    const json = (body: unknown) =>
      ({ ok: true, status: 200, json: async () => body } as Response)
    if (base === GEOCODER_URL) {
      if (geocoderDown) throw new TypeError("Failed to fetch")
      return json({ candidates: geocoderCandidates })
    }
    if (base === HOUSE_DISTRICTS_URL)
      return json({ features: [{ attributes: { REP_DIST: "8th Suffolk" } }] })
    if (base === SENATE_DISTRICTS_URL)
      return json({ features: [{ attributes: { SEN_DIST: "Third Suffolk" } }] })
    throw new Error(`unexpected request ${url}`)
  }) as typeof fetch
})

const match = (address: string, score: number) => ({
  address,
  score,
  location: { x: -71.06, y: 42.36 },
  attributes: { Addr_type: "PointAddress" }
})

async function search(text: string) {
  await userEvent.type(screen.getByRole("textbox"), text)
  await userEvent.click(
    screen.getByRole("button", { name: "legislator.lookup.find" })
  )
}

it("fills in both legislators for a clear match", async () => {
  geocoderCandidates = [match("10 EXAMPLE ST, BOSTON, MA, 02108", 100)]
  const onFound = jest.fn()
  render(<AddressLookup index={index} onFound={onFound} />)

  await search("10 Example St, Boston")

  await waitFor(() => expect(onFound).toHaveBeenCalledTimes(1))
  expect(onFound.mock.calls[0][0]).toMatchObject({
    address: "10 EXAMPLE ST, BOSTON, MA, 02108",
    representative: { member: { id: "R1", name: "Pat Example" } },
    senator: { member: { id: "S1", name: "Lee Placeholder" } }
  })
  expect(screen.getByText("legislator.lookup.found")).toBeInTheDocument()
})

it("lets the user pick when the address is ambiguous", async () => {
  geocoderCandidates = [
    match("1 SAMPLE ST, BOSTON, MA, 02108", 100),
    match("1 SAMPLE ST, BROOKLINE, MA, 02446", 100)
  ]
  const onFound = jest.fn()
  render(<AddressLookup index={index} onFound={onFound} />)

  await search("1 Sample St")
  await userEvent.click(
    await screen.findByRole("button", {
      name: "1 SAMPLE ST, BROOKLINE, MA, 02446"
    })
  )

  await waitFor(() => expect(onFound).toHaveBeenCalledTimes(1))
  expect(onFound.mock.calls[0][0].address).toBe(
    "1 SAMPLE ST, BROOKLINE, MA, 02446"
  )
})

it("points to the legislature's tool when MassGIS is down", async () => {
  geocoderDown = true
  const onFound = jest.fn()
  render(<AddressLookup index={index} onFound={onFound} />)

  await search("10 Example St, Boston")

  expect(
    await screen.findByText("legislator.lookup.unavailable")
  ).toBeInTheDocument()
  expect(onFound).not.toHaveBeenCalled()
})
