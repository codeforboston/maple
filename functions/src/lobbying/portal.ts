/**
 * HTTP client and HTML parser for the MA Secretary of State lobbying portal.
 *
 * Portal: https://www.sec.state.ma.us/LobbyistPublicSearch/
 *
 * Page flow:
 *   1. Search POST  → grdvSearchResultByTypeAndCategory table
 *                     One row per registrant; each row has a Summary.aspx link.
 *   2. Summary.aspx → registrant name/year/type + CompleteDisclosure links
 *   3. CompleteDisclosure.aspx → per-client compensation + per-client bill activity
 *
 * Two disclosure HTML formats exist:
 *   Modern (≥~2013): per-client compensation in grdvClientPaidToEntity;
 *     per-client bill tables as grdvActivitiesNew{year}_{n}.
 *   Legacy (<~2013): total salary in grdvSalaryPaid (no client breakdown);
 *     all bill activity in a single grdvActivities table.
 */

import axios, { AxiosInstance } from "axios"
import { JSDOM } from "jsdom"
import { sha256 } from "js-sha256"
import { CookieJar } from "tough-cookie"
import {
  CHAMBER_PREFIXES,
  LEGACY_CHAMBER_MAP,
  LEGACY_TOTAL_CLIENT,
  LobbyingChamber
} from "./types"

// ─── Constants ──────────────────────────────────────────────────────────────

const BASE_URL = "https://www.sec.state.ma.us/LobbyistPublicSearch/"
const SEARCH_URL = BASE_URL + "Default.aspx"
const REQUEST_DELAY_MS = 1000
const MAX_RETRIES = 5

const IPAD_UA =
  "Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) " +
  "AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148"

const FIRST_GC = 183
const FIRST_GC_START_YEAR = 2003

// ─── Public types ───────────────────────────────────────────────────────────

export interface RawCompensation {
  clientName: string
  amount: number | null
}

export interface RawBillActivity {
  clientName: string
  chamber: LobbyingChamber
  rawBillNumber: string
  billId: string | null // pre-computed from chamber + rawBillNumber
  activityTitle: string
  position: string
  amount: number | null
}

export interface DisclosureMeta {
  entityName: string
  year: number | null
  /** Portal reg_type mapped to our vocabulary */
  regType: "Lobbyist" | "Employer"
  disclosureUrls: string[]
}

export interface DisclosureDetail {
  compensation: RawCompensation[]
  bills: RawBillActivity[]
}

// ─── HTTP helpers ────────────────────────────────────────────────────────────

/**
 * Create an axios instance pre-configured for the MA SoS portal.
 *
 * Includes a cookie jar via interceptors so ASP.NET session state (ViewState,
 * anti-forgery tokens) is preserved across the GET → POST page flow without
 * requiring the axios-cookiejar-support package.
 */
export interface PortalClient {
  jar: CookieJar
  client: AxiosInstance
}

/**
 * Create a portal client pre-configured for the MA SoS portal.
 *
 * Uses maxRedirects: 0 so our manual redirect loop (inside getHtml / postHtml)
 * can extract Set-Cookie headers at each hop before following. This is necessary
 * because the portal is protected by Incapsula, which issues a 302 challenge on
 * first contact and requires the session cookies to be sent on the retried request.
 * Axios's built-in redirect following happens before response interceptors fire,
 * so the cookies from the challenge response are never captured automatically.
 */
export function makePortalClient(): PortalClient {
  const jar = new CookieJar()
  const client = axios.create({
    headers: {
      "User-Agent": IPAD_UA,
      Accept: "*/*",
      "Accept-Encoding": "gzip, deflate, br",
      Connection: "keep-alive"
    },
    timeout: 60_000,
    maxRedirects: 10, // let axios handle ordinary redirects; only Incapsula challenges need manual handling
    validateStatus: s => s < 500 // surface 4xx so we can log them
  })
  return { jar, client }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function cookieHeader(jar: CookieJar, url: string): string {
  return jar
    .getCookiesSync(url)
    .map(c => c.cookieString())
    .join("; ")
}

function saveCookies(
  jar: CookieJar,
  url: string,
  headers: Record<string, string | string[] | undefined>
): void {
  const raw = headers["set-cookie"]
  if (!raw) return
  const list = Array.isArray(raw) ? raw : [raw]
  for (const c of list) jar.setCookieSync(c, url)
}

async function getHtml(
  pc: PortalClient,
  url: string,
  retries = MAX_RETRIES
): Promise<Document> {
  for (let attempt = 0; attempt < retries; attempt++) {
    await sleep(
      attempt === 0 ? REQUEST_DELAY_MS : REQUEST_DELAY_MS * 2 ** attempt
    )
    try {
      const res = await pc.client.get<string>(url, {
        responseType: "text",
        headers: { Cookie: cookieHeader(pc.jar, url) }
      })
      saveCookies(
        pc.jar,
        url,
        res.headers as Record<string, string | string[] | undefined>
      )
      if (res.status >= 400) throw new Error(`HTTP ${res.status} for ${url}`)
      return new JSDOM(res.data).window.document
    } catch (e) {
      if (attempt === retries - 1) throw e
      if (axios.isAxiosError(e)) continue
      throw e
    }
  }
  throw new Error("unreachable")
}

async function postHtml(
  pc: PortalClient,
  url: string,
  data: Record<string, string>,
  retries = MAX_RETRIES
): Promise<Document> {
  const body = new URLSearchParams(data).toString()
  for (let attempt = 0; attempt < retries; attempt++) {
    await sleep(
      attempt === 0 ? REQUEST_DELAY_MS : REQUEST_DELAY_MS * 2 ** attempt
    )
    try {
      const res = await pc.client.post<string>(url, body, {
        responseType: "text",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Cookie: cookieHeader(pc.jar, url)
        },
        timeout: 180_000
      })
      saveCookies(
        pc.jar,
        url,
        res.headers as Record<string, string | string[] | undefined>
      )
      if (res.status >= 400) throw new Error(`HTTP ${res.status} for ${url}`)
      return new JSDOM(res.data).window.document
    } catch (e) {
      if (attempt === retries - 1) throw e
      if (axios.isAxiosError(e)) continue
      throw e
    }
  }
  throw new Error("unreachable")
}

// ─── Year / General Court helpers ────────────────────────────────────────────

export function yearToGeneralCourt(year: number): number {
  return FIRST_GC + Math.floor((year - FIRST_GC_START_YEAR) / 2)
}

// ─── Chamber normalization ────────────────────────────────────────────────────

/** Normalize raw portal chamber string to a canonical LobbyingChamber value. */
export function normalizeChamber(raw: string): LobbyingChamber {
  const trimmed = raw.trim()
  if (LEGACY_CHAMBER_MAP[trimmed]) return LEGACY_CHAMBER_MAP[trimmed]
  const known: LobbyingChamber[] = [
    "House Bill",
    "Senate Bill",
    "House Docket",
    "Senate Docket",
    "Executive"
  ]
  if (known.includes(trimmed as LobbyingChamber))
    return trimmed as LobbyingChamber
  return "Other"
}

/**
 * Construct the MAPLE-compatible billId from the portal's chamber + raw integer.
 *
 * The portal stores bill numbers as bare integers; the chamber prefix is what
 * distinguishes H1234 from S1234. Returns null for Executive and Other chambers
 * where no bill join is possible.
 */
export function constructBillId(
  chamber: LobbyingChamber,
  rawBillNumber: string
): string | null {
  const prefix = CHAMBER_PREFIXES[chamber]
  if (!prefix) return null
  const n = parseInt(rawBillNumber, 10)
  if (isNaN(n)) return null
  return `${prefix}${n}`
}

// ─── Document ID generation ───────────────────────────────────────────────────

/** Stable Firestore document ID for a registrant (entity + year). */
export function registrantId(entityName: string, year: number): string {
  return sha256(`${year}|${entityName}`).slice(0, 40)
}

/**
 * Stable Firestore document ID for a filing.
 *
 * Uses a hash of the logical deduplication key. For null-bill rows (billId is
 * null) the chamber is included in the key to avoid merging executive null rows
 * with legislative null rows.
 */
export function filingId(
  entityName: string,
  clientName: string,
  chamber: LobbyingChamber,
  billId: string | null,
  generalCourt: number,
  position: string
): string {
  const key = [
    entityName,
    clientName,
    chamber,
    billId ?? "__null__",
    generalCourt,
    position
  ].join("|")
  return sha256(key).slice(0, 40)
}

// ─── Amount parsing ───────────────────────────────────────────────────────────

function parseAmount(text: string): number | null {
  const cleaned = text.replace(/[$,]/g, "").trim()
  const n = parseFloat(cleaned)
  return isNaN(n) ? null : n
}

// ─── Portal scraping functions ────────────────────────────────────────────────

/** Extract ASP.NET WebForms ViewState hidden inputs from a page. */
function extractViewState(doc: Document): Record<string, string> {
  const fields: Record<string, string> = {}
  doc.querySelectorAll('input[type="hidden"]').forEach(el => {
    const input = el as HTMLInputElement
    if (input.name) fields[input.name] = input.value ?? ""
  })
  return fields
}

/**
 * Fetch all Summary.aspx URLs for a given year.
 * Sends a single search POST with page size 20000 to get all registrants at once.
 */
export async function fetchSummaryLinks(
  pc: PortalClient,
  year: number
): Promise<string[]> {
  const searchPage = await getHtml(pc, SEARCH_URL)
  const vs = extractViewState(searchPage)

  const postData: Record<string, string> = {
    ...vs,
    __EVENTTARGET: "",
    __EVENTARGUMENT: "",
    ctl00$ContentPlaceHolder1$Search: "rdbSearchByType",
    ctl00$ContentPlaceHolder1$ucSearchCriteriaByType$ddlYear: String(year),
    ctl00$ContentPlaceHolder1$ucSearchCriteriaByType$txtN_ame: "",
    ctl00$ContentPlaceHolder1$ucSearchCriteriaByType$lddSearchType$DropDown:
      "3",
    ctl00$ContentPlaceHolder1$ucSearchCriteriaByType$drpType: "L",
    ctl00$ContentPlaceHolder1$drpPageSize: "20000",
    ctl00$ContentPlaceHolder1$btnSearch: "Search"
  }

  const resultsPage = await postHtml(pc, SEARCH_URL, postData)

  const table = resultsPage.querySelector(
    '[id*="grdvSearchResultByTypeAndCategory"]'
  )
  if (!table) return []

  const links: string[] = []
  table.querySelectorAll("a[href]").forEach(el => {
    const href = (el as HTMLAnchorElement).href
    if (href && href.includes("Summary.aspx")) {
      // href from JSDOM is already absolute when base is set; handle both cases
      const url = href.startsWith("http") ? href : BASE_URL + href
      links.push(url)
    }
  })
  return links
}

/**
 * Fetch a Summary.aspx page and return the registrant metadata + disclosure URLs.
 */
export async function fetchDisclosureMeta(
  pc: PortalClient,
  summaryUrl: string
): Promise<DisclosureMeta> {
  const doc = await getHtml(pc, summaryUrl)

  const text = (id: string) => {
    const el = doc.getElementById(id)
    return el?.textContent?.trim() ?? ""
  }

  const entityName = text("ContentPlaceHolder1_lblRegistrantName")
  const yearText = text("ContentPlaceHolder1_lblYear")
  const regTypeRaw = text("ContentPlaceHolder1_lblRegType")

  const year = parseInt(yearText, 10)
  const regType: "Lobbyist" | "Employer" = regTypeRaw.includes("Entity")
    ? "Employer"
    : "Lobbyist"

  const disclosureUrls: string[] = []
  doc.querySelectorAll("a[href]").forEach(el => {
    const raw = (el as HTMLAnchorElement).getAttribute("href") ?? ""
    if (raw.includes("CompleteDisclosure")) {
      const url = raw.startsWith("http") ? raw : BASE_URL + raw
      disclosureUrls.push(url)
    }
  })

  return {
    entityName,
    year: isNaN(year) ? null : year,
    regType,
    disclosureUrls
  }
}

/**
 * Parse a CompleteDisclosure.aspx page.
 *
 * Handles both modern (≥~2013) and legacy (<~2013) HTML layouts.
 */
export async function fetchDisclosureDetail(
  pc: PortalClient,
  discUrl: string,
  year: number
): Promise<DisclosureDetail> {
  const doc = await getHtml(pc, discUrl)
  const compensation: RawCompensation[] = []
  const bills: RawBillActivity[] = []

  // ── Modern format ──────────────────────────────────────────────────────────
  const compTable = doc.querySelector('[id*="grdvClientPaidToEntity"]')
  if (compTable) {
    compTable
      .querySelectorAll("tr.GridRow, tr.GridAlternatingRow")
      .forEach(row => {
        const cells = Array.from(row.querySelectorAll("td")).map(
          td => td.textContent?.trim() ?? ""
        )
        if (cells.length >= 2) {
          compensation.push({
            clientName: cells[0],
            amount: parseAmount(cells[1])
          })
        }
      })
  }

  // Bill activity tables — one per client per reporting period. Two ID patterns:
  //   2014–2018: …rptActivityNew_grdvActivitiesNew_0      (no year suffix)
  //   2019+:     …rptActivityNew2020_grdvActivitiesNew2020_0 (year suffix)
  doc.querySelectorAll('[id*="grdvActivitiesNew"]').forEach(actTable => {
    // The client name lives in the nearest preceding span with lblClientName
    let clientName = ""
    let node: Element | null = actTable
    while ((node = node.previousElementSibling ?? node.parentElement)) {
      const span = node.id?.includes("lblClientName")
        ? node
        : node.querySelector?.('[id*="lblClientName"]')
      if (span) {
        clientName = span.textContent?.trim() ?? ""
        break
      }
      if (node === node.parentElement) break
    }

    actTable
      .querySelectorAll("tr.GridRow, tr.GridAlternatingRow")
      .forEach(row => {
        const cells = Array.from(row.querySelectorAll("td")).map(
          td => td.textContent?.trim() ?? ""
        )
        // Columns: House/Senate, Bill Number, Bill title, Position, Amount, Direct business
        if (cells.length < 4) return
        const chamber = normalizeChamber(cells[0])
        const rawBillNumber = cells[1]
        const billId = constructBillId(chamber, rawBillNumber)
        bills.push({
          clientName,
          chamber,
          rawBillNumber,
          billId,
          activityTitle: cells[2] ?? "",
          position: cells[3] ?? "",
          amount: cells.length > 4 ? parseAmount(cells[4]) : null
        })
      })
  })

  if (compTable || bills.length > 0) {
    return { compensation, bills }
  }

  // ── Legacy format (<~2013) ─────────────────────────────────────────────────
  const salaryTable = doc.querySelector('[id*="grdvSalaryPaid"]')
  if (salaryTable) {
    let total = 0
    salaryTable.querySelectorAll("tr").forEach(row => {
      const cells = Array.from(row.querySelectorAll("td")).map(
        td => td.textContent?.trim() ?? ""
      )
      if (cells.length >= 2 && !cells[0].includes("Total")) {
        const amt = parseAmount(cells[1])
        if (amt !== null) total += amt
      }
    })
    if (total > 0) {
      compensation.push({ clientName: LEGACY_TOTAL_CLIENT, amount: total })
    }
  }

  // Legacy bill activity: single grdvActivities table. Three known column layouts:
  //   2009 4-col:               Date | Bill+Title | Lobbyist | Client
  //   2010+ individual 5-col:   Activity | Position | DirectBiz | Client | Compensation
  //   2010+ entity 6-col:       Activity | Lobbyist | Position | DirectBiz | Client | Compensation
  const actTable = doc.querySelector('[id$="grdvActivities"]')
  if (actTable) {
    const allRows = Array.from(actTable.querySelectorAll("tr"))
    const headerCells = Array.from(
      allRows[0]?.querySelectorAll("th, td") ?? []
    ).map(el => el.textContent?.trim() ?? "")

    let billCol = 1
    let positionCol: number | null = null
    let clientCol = 3

    if (headerCells[0]?.includes("Activity")) {
      if (headerCells[1]?.includes("Lobbyist")) {
        // 6-col entity layout
        billCol = 0
        positionCol = 2
        clientCol = 4
      } else {
        // 5-col individual layout
        billCol = 0
        positionCol = 1
        clientCol = 3
      }
    }

    const chamberMap: Record<string, LobbyingChamber> = {
      H: "House Bill",
      S: "Senate Bill",
      HD: "House Docket",
      SD: "Senate Docket"
    }

    allRows.slice(1).forEach(row => {
      const cells = Array.from(row.querySelectorAll("td")).map(
        td => td.textContent?.trim() ?? ""
      )
      if (cells.length <= Math.max(billCol, clientCol)) return

      const billCell = cells[billCol]
      const skipValues = new Set([
        "Activity or Bill No and Title",
        "N/A",
        "None",
        "",
        "Total amount"
      ])
      if (!billCell || skipValues.has(billCell)) return

      const parts = billCell.split(/\s+/)
      const billNo = parts[0]
      const activityTitle = parts.slice(1).join(" ")
      const match = billNo.match(/^([A-Z]+)(\d+)$/)
      if (!match) return

      const [, prefix, number] = match
      const chamber: LobbyingChamber = chamberMap[prefix] ?? "Other"
      const billId = constructBillId(chamber, number)
      const position = positionCol !== null ? cells[positionCol] ?? "" : ""
      const clientName = cells[clientCol] ?? ""

      bills.push({
        clientName,
        chamber,
        rawBillNumber: number,
        billId,
        activityTitle,
        position,
        amount: null
      })
    })
  }

  return { compensation, bills }
}
