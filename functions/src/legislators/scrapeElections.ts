import { JSDOM, VirtualConsole } from "jsdom"
import {
  ElectionStage,
  parties,
  Party,
  ElectionInfo,
  StageSelection,
  ElectionResult,
  ElectionCandidate,
  Office,
  officeIds
} from "./electionTypes"

const baseURL = "https://electionstats.state.ma.us"

function parsePartyString(affiliationText: string): {
  writeIn: boolean
  party?: string
} {
  const writeIn = /\bwrite-in\b/i.test(affiliationText)

  let party
  affiliationText = affiliationText
    .replace(/\(?write-in\)?/i, "")
    .replace(/unenrolled/i, "")
    .trim()
  if (affiliationText) {
    party = affiliationText
  }

  return {
    writeIn,
    ...(party ? { party } : {})
  }
}

function precinctHeaderText(th: Element | undefined): string | undefined {
  const a = th?.querySelector("a[title]") ?? th?.querySelector("a[oldtitle]")
  return (
    a?.getAttribute("title") ??
    a?.getAttribute("oldtitle") ??
    th?.textContent?.trim()
  )
}

async function fetchElectionData(
  url: string
): Promise<[ElectionResult, string[]]> {
  const text = await (await fetch(url)).text()

  const virtualConsole = new VirtualConsole()
  virtualConsole.on("jsdomError", error => {
    if (error.message.includes("Could not parse CSS stylesheet")) {
      return
    }
    console.error(error)
  })

  const dom = new JSDOM(text, { virtualConsole })
  const document = dom.window.document

  const table = document.querySelector("table.precinct_data")
  if (!table) {
    throw new Error(`No result table in ${url}`)
  }
  const headers = Array.from(table.querySelectorAll("thead tr th")).map(
    th => precinctHeaderText(th) ?? ""
  )
  const totalRow = table.querySelector("tbody tr.total")
  if (!totalRow) {
    throw new Error(`${url} has no table row for 'total'`)
  }
  const cells = Array.from(totalRow.querySelectorAll("td"))
  const values = new Map<string, number>()
  // Avoid leftward descriptive titles
  headers.reverse()
  cells.reverse()
  headers.forEach((header, i) => {
    const text = cells[i].textContent?.replace(/,/g, "").trim()
    if (text && /^\d+$/.test(text)) {
      values.set(header, parseInt(text))
    }
  })

  const candidates = Array.from(
    document.querySelectorAll(".candidate_key .item")
  ).map(item => {
    const nameElem = item.querySelector<HTMLAnchorElement>(".display_name a")
    const name = nameElem?.textContent?.trim()
    const votes = values.get(name ?? "")
    if (!nameElem || !name || !nameElem.href || !votes) {
      throw new Error(
        `${item.outerHTML} does not have one of ".display_name a", name, or votes (from ${values})`
      )
    }
    return {
      name,
      party: parsePartyString(
        item.querySelector(".party")?.textContent?.trim() ?? ""
      ),
      votes,
      candidateUrl: `${baseURL}${nameElem.href}`
    }
  })

  candidates.sort((a, b) => b.votes - a.votes)

  const candidateVotes = candidates.map(candidate => {
    return {
      name: candidate.name,
      votes: candidate.votes,
      ...candidate.party
    }
  })

  const noPreference = values.has("No Preference")
    ? { noPreferenceVotes: values.get("No Preference") }
    : {}

  const [otherVotes, blankVotes, totalVotes] = [
    values.get("All Others"),
    values.get("Blanks"),
    values.get("Total Votes Cast")
  ]
  if (!totalVotes) {
    throw new Error(`${url} has no 'Total' column`)
  }
  return [
    {
      candidates: candidateVotes,
      otherVotes: otherVotes ?? 0,
      blankVotes: blankVotes ?? 0,
      totalVotes,
      electionDetailsUrl: url,
      ...noPreference
    },
    candidates.map(candidate => candidate.candidateUrl)
  ]
}

function parseElectionStage(input: string): ElectionStage | null {
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

  const partyPattern = parties
    .map(escape)
    .sort((a, b) => b.length - a.length)
    .join("|")

  const regex = new RegExp(`^(Special )?(${partyPattern}) (Primary|Election)$`)

  const match = input.match(regex)
  if (!match) {
    return null
  }

  const [, special, party, stage] = match

  // Only "General Election" is valid.
  if (stage === "Election" && party !== "General") {
    return null
  }

  // Only non-General parties have primaries.
  if (stage === "Primary" && party === "General") {
    return null
  }

  return {
    party: Party.check(party),
    special: special !== undefined
  }
}

async function parseElectionTable(
  table: Element
): Promise<[ElectionResult, string[]]> {
  if (table.querySelector(".other-candidates")) {
    // The search page does not include all details on this election; secondary fetch
    const link = table.querySelector<HTMLAnchorElement>("tr.more_info a")?.href
    if (!link) {
      throw new Error(`${table.outerHTML} has no 'more info' link`)
    }
    const electionDetailsUrl = `${baseURL}${link}`
    return await fetchElectionData(electionDetailsUrl)
  }
  const candidateRows = table.querySelectorAll(
    ":scope > tr:not(.non_candidate):not(.more_info)"
  )

  const candidates = Array.from(candidateRows).map(row => {
    const nameElem = row.querySelector<HTMLAnchorElement>(".candidate .name a")
    const name = nameElem?.textContent?.trim() || ""
    const partyText =
      row.querySelector(".candidate .party")?.textContent?.trim() || ""
    const link = nameElem?.href

    const voteText = row
      .querySelector("td:nth-child(2)")
      ?.textContent?.replace(/,/g, "")
    if (!name || !voteText || !link) {
      throw new Error(
        `One of name, voteText, or candidate link is missing from ${row.outerHTML}`
      )
    }

    const candidate = {
      name,
      votes: parseInt(voteText, 10),
      ...parsePartyString(partyText)
    }

    const ret: [ElectionCandidate, string] = [candidate, `${baseURL}${link}`]
    return ret
  })

  candidates.sort((a, b) => b[0].votes - a[0].votes)

  const getSummaryValue = (selector: string): number | null => {
    const row = table.querySelector(selector)

    const text = row
      ?.querySelector("td:nth-child(2)")
      ?.textContent?.replace(/,/g, "")
    if (!text) {
      return null
    }

    return parseInt(text, 10)
  }

  const link = table.querySelector<HTMLAnchorElement>("tr.more_info a")?.href
  if (!link) {
    throw new Error(`More info link missing from ${table.outerHTML}`)
  }

  const [otherVotes, blankVotes, totalVotes] = [
    getSummaryValue("tr.n_all_other_votes"),
    getSummaryValue("tr.n_blank_votes"),
    getSummaryValue("tr.n_total_votes")
  ]
  const noPreference = getSummaryValue("tr.n_no_preference_votes")
  if (!totalVotes) {
    throw new Error(`No total votes row in ${table.outerHTML}`)
  }
  return [
    {
      candidates: candidates.map(item => item[0]),
      otherVotes: otherVotes ?? 0,
      blankVotes: blankVotes ?? 0,
      totalVotes,
      electionDetailsUrl: `${baseURL}${link}`,
      ...(noPreference ? { noPreferenceVotes: noPreference } : {})
    },
    candidates.map(item => item[1])
  ]
}

async function electionsPageInfo(dom: JSDOM): Promise<ElectionInfo[]> {
  const elements = Array.from(
    dom.window.document.querySelectorAll('[id^="election-id-"]')
  )
  const info = elements.map(async electionElem => {
    const electTDs = Array.from(electionElem.children).filter(
      child => child.tagName === "TD"
    )
    const yearText = electTDs[0].textContent
    if (!yearText) {
      throw new Error(`Year not present in ${electionElem.outerHTML}`)
    }
    const year = parseInt(yearText, 10)
    const office = electTDs[1].textContent?.trim()
    const districts = electTDs[2].textContent?.trim()
    if (!year || !office || !districts) {
      throw new Error(
        `Year, office, or districts not present in ${electionElem.outerHTML}`
      )
    }
    const stage = parseElectionStage(electTDs[3].textContent?.trim() ?? "")
    if (!stage) {
      throw new Error(
        `${stage} is not a recognized election stage: ${electTDs[3].outerHTML}`
      )
    }
    if (electTDs[4].querySelector(":scope > .no_candidates")) {
      return ElectionInfo.check({
        year,
        office,
        districts,
        candidateUrls: [],
        ...stage
      })
    }
    const candidateTable = electTDs[4].querySelector(":scope tbody")
    if (!candidateTable) {
      throw new Error(`No candidate table in ${electionElem.outerHTML}`)
    }
    const [result, candidateUrls] = await parseElectionTable(candidateTable)

    return ElectionInfo.check({
      year,
      office,
      districts,
      ...stage,
      candidateUrls,
      result
    })
  })
  return Promise.all(info)
}

export async function fetchElectionsData(
  startYear: number,
  endYear: number,
  office?: Office,
  stage: StageSelection | null = "General"
): Promise<ElectionInfo[]> {
  const officeId = office ? `/office_id:${officeIds[office]}` : ""
  const electionStage = stage ? `/stage:${stage}` : ""
  const url = `${baseURL}/elections/search/year_from:${startYear}/year_to:${endYear}${officeId}${electionStage}`
  const page = await fetch(url)
  const text = await page.text()
  const virtualConsole = new VirtualConsole()
  virtualConsole.on("jsdomError", error => {
    if (error.message.includes("Could not parse CSS stylesheet")) {
      return
    }
    console.error(error)
  })
  const dom = new JSDOM(text, { virtualConsole })
  return electionsPageInfo(dom)
}
