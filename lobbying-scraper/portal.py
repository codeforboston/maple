"""HTTP client and HTML parser for the MA SoS lobbying portal.

Portal: https://www.sec.state.ma.us/LobbyistPublicSearch/

Page flow:
  1. Search POST  → summary links table
  2. Summary.aspx → registrant name/year/type + CompleteDisclosure links
  3. CompleteDisclosure.aspx → per-client compensation + per-client bill activity

Two disclosure HTML formats:
  Modern (>=~2013): grdvClientPaidToEntity + grdvActivitiesNew{year}_{n} tables.
  Legacy (<~2013):  grdvSalaryPaid (total only) + grdvActivities (all bills).
"""

from __future__ import annotations

import hashlib
import re
import time
from dataclasses import dataclass, field
from typing import Optional

import requests
from bs4 import BeautifulSoup, Tag

# ── Constants ─────────────────────────────────────────────────────────────────

BASE_URL = "https://www.sec.state.ma.us/LobbyistPublicSearch/"
SEARCH_URL = BASE_URL + "Default.aspx"

_UA = (
    "Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) "
    "AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148"
)
_REQUEST_DELAY = 1.0
_MAX_RETRIES = 5

# Lobby disclosure data begins in 2005; GC 183 started Jan 2003.
FIRST_YEAR = 2005
FIRST_GC = 183
FIRST_GC_START_YEAR = 2003

# clientName sentinel for pre-2013 filings where compensation is a single total
LEGACY_TOTAL_CLIENT = "_total_salary_"

# Maps canonical chamber names to the bill-ID prefix used in MAPLE's Bill.id
CHAMBER_PREFIXES: dict[str, str] = {
    "House Bill": "H",
    "Senate Bill": "S",
    "House Docket": "HD",
    "Senate Docket": "SD",
}

# Legacy short-form chamber codes found in older filings
LEGACY_CHAMBER_MAP: dict[str, str] = {
    "HB": "House Bill",
    "SB": "Senate Bill",
}

# ── Data types ────────────────────────────────────────────────────────────────


@dataclass
class Compensation:
    client_name: str
    amount: Optional[float]


@dataclass
class BillActivity:
    client_name: str
    chamber: str          # canonical LobbyingChamber value
    raw_bill_number: str
    bill_id: Optional[str]  # e.g. "H1234"; null for Executive/Other
    activity_title: str
    position: str
    amount: Optional[float]


@dataclass
class DisclosureMeta:
    entity_name: str
    year: Optional[int]
    reg_type: str         # "Lobbyist" | "Employer"
    disclosure_urls: list[str] = field(default_factory=list)


@dataclass
class DisclosureDetail:
    compensation: list[Compensation] = field(default_factory=list)
    bills: list[BillActivity] = field(default_factory=list)


# ── Derived-value helpers ─────────────────────────────────────────────────────


def year_to_general_court(year: int) -> int:
    return FIRST_GC + (year - FIRST_GC_START_YEAR) // 2


def normalize_chamber(raw: str) -> str:
    t = raw.strip()
    if t in LEGACY_CHAMBER_MAP:
        return LEGACY_CHAMBER_MAP[t]
    known = {"House Bill", "Senate Bill", "House Docket", "Senate Docket", "Executive"}
    return t if t in known else "Other"


def construct_bill_id(chamber: str, raw_bill_number: str) -> Optional[str]:
    """Construct the MAPLE-compatible billId from chamber + raw integer.

    Returns None for Executive and Other chambers where no bill join is possible.
    H1234 and S1234 are distinct bills even though they share the same integer —
    the prefix is required to disambiguate.
    """
    prefix = CHAMBER_PREFIXES.get(chamber)
    if not prefix:
        return None
    try:
        return f"{prefix}{int(raw_bill_number)}"
    except (ValueError, TypeError):
        return None


def registrant_id(entity_name: str, year: int) -> str:
    key = f"{year}|{entity_name}"
    return hashlib.sha256(key.encode()).hexdigest()[:40]


def filing_id(
    entity_name: str,
    client_name: str,
    chamber: str,
    bill_id: Optional[str],
    general_court: int,
    position: str,
) -> str:
    key = "|".join([entity_name, client_name, chamber, bill_id or "__null__",
                    str(general_court), position])
    return hashlib.sha256(key.encode()).hexdigest()[:40]


# ── HTTP session ──────────────────────────────────────────────────────────────


def make_session() -> requests.Session:
    s = requests.Session()
    s.headers.update({
        "User-Agent": _UA,
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
    })
    return s


def _get(session: requests.Session, url: str) -> BeautifulSoup:
    for attempt in range(_MAX_RETRIES):
        time.sleep(_REQUEST_DELAY * (2 ** attempt) if attempt else _REQUEST_DELAY)
        try:
            r = session.get(url, timeout=60)
            r.raise_for_status()
            return BeautifulSoup(r.text, "html.parser")
        except (requests.exceptions.Timeout, requests.exceptions.ConnectionError) as e:
            if attempt == _MAX_RETRIES - 1:
                raise
            print(f"  GET retry {attempt + 1}: {e}")


def _post(session: requests.Session, url: str, data: dict) -> BeautifulSoup:
    for attempt in range(_MAX_RETRIES):
        time.sleep(_REQUEST_DELAY * (2 ** attempt) if attempt else _REQUEST_DELAY)
        try:
            r = session.post(url, data=data, timeout=180)
            r.raise_for_status()
            return BeautifulSoup(r.text, "html.parser")
        except (requests.exceptions.Timeout, requests.exceptions.ConnectionError) as e:
            if attempt == _MAX_RETRIES - 1:
                raise
            print(f"  POST retry {attempt + 1}: {e}")


# ── Portal scraping ───────────────────────────────────────────────────────────


def _viewstate(soup: BeautifulSoup) -> dict:
    return {
        inp["name"]: inp.get("value", "")
        for inp in soup.find_all("input", type="hidden")
        if inp.get("name")
    }


def fetch_summary_links(session: requests.Session, year: int) -> list[str]:
    """Return all Summary.aspx URLs for a given year via a single search POST."""
    soup = _get(session, SEARCH_URL)
    data = {
        **_viewstate(soup),
        "__EVENTTARGET": "",
        "__EVENTARGUMENT": "",
        "ctl00$ContentPlaceHolder1$Search": "rdbSearchByType",
        "ctl00$ContentPlaceHolder1$ucSearchCriteriaByType$ddlYear": str(year),
        "ctl00$ContentPlaceHolder1$ucSearchCriteriaByType$txtN_ame": "",
        "ctl00$ContentPlaceHolder1$ucSearchCriteriaByType$lddSearchType$DropDown": "3",
        "ctl00$ContentPlaceHolder1$ucSearchCriteriaByType$drpType": "L",
        "ctl00$ContentPlaceHolder1$drpPageSize": "20000",
        "ctl00$ContentPlaceHolder1$btnSearch": "Search",
    }
    results = _post(session, SEARCH_URL, data)
    table = results.find("table", id=lambda x: x and "grdvSearchResultByTypeAndCategory" in x)
    if not table:
        return []
    return [
        BASE_URL + a["href"] if not a["href"].startswith("http") else a["href"]
        for a in table.find_all("a", href=True)
        if "Summary.aspx" in a["href"]
    ]


def fetch_disclosure_meta(session: requests.Session, summary_url: str) -> DisclosureMeta:
    soup = _get(session, summary_url)

    def text(el_id: str) -> str:
        el = soup.find(id=el_id)
        return el.get_text(strip=True) if el else ""

    entity_name = text("ContentPlaceHolder1_lblRegistrantName")
    year_text = text("ContentPlaceHolder1_lblYear")
    reg_type_raw = text("ContentPlaceHolder1_lblRegType")

    try:
        year = int(year_text)
    except ValueError:
        year = None

    reg_type = "Employer" if "Entity" in reg_type_raw else "Lobbyist"

    disc_urls = [
        BASE_URL + a["href"] if not a["href"].startswith("http") else a["href"]
        for a in soup.find_all("a", href=True)
        if "CompleteDisclosure" in a["href"]
    ]

    return DisclosureMeta(
        entity_name=entity_name,
        year=year,
        reg_type=reg_type,
        disclosure_urls=disc_urls,
    )


def _parse_amount(text: str) -> Optional[float]:
    cleaned = text.replace("$", "").replace(",", "").strip()
    try:
        return float(cleaned)
    except ValueError:
        return None


def _grid_rows(table: Tag) -> list[Tag]:
    return table.find_all("tr", class_=lambda c: c and "Grid" in c and "Header" not in c)


def fetch_disclosure_detail(
    session: requests.Session, disc_url: str, year: int
) -> DisclosureDetail:
    soup = _get(session, disc_url)
    compensation: list[Compensation] = []
    bills: list[BillActivity] = []
    gc = year_to_general_court(year)

    # ── Modern format (>=~2013) ───────────────────────────────────────────────
    comp_table = soup.find("table", id=lambda x: x and "grdvClientPaidToEntity" in (x or ""))
    if comp_table:
        for row in _grid_rows(comp_table):
            cells = [td.get_text(strip=True) for td in row.find_all("td")]
            if len(cells) >= 2:
                compensation.append(Compensation(
                    client_name=cells[0],
                    amount=_parse_amount(cells[1]),
                ))

    act_tables = soup.find_all(
        "table",
        id=lambda x: x and re.search(r"grdvActivitiesNew(\d{4})?_\d+", x or ""),
    )
    for act_table in act_tables:
        # Walk backwards to find the nearest lblClientName span
        client_name = ""
        node = act_table
        while node:
            node = node.find_previous(["span", "div", "td"])
            if not node:
                break
            if node.get("id") and "lblClientName" in node["id"]:
                client_name = node.get_text(strip=True)
                break

        for row in _grid_rows(act_table):
            cells = [td.get_text(strip=True) for td in row.find_all("td")]
            if len(cells) < 4:
                continue
            chamber = normalize_chamber(cells[0])
            raw_num = cells[1]
            bill_id = construct_bill_id(chamber, raw_num)
            bills.append(BillActivity(
                client_name=client_name,
                chamber=chamber,
                raw_bill_number=raw_num,
                bill_id=bill_id,
                activity_title=cells[2] if len(cells) > 2 else "",
                position=cells[3] if len(cells) > 3 else "",
                amount=_parse_amount(cells[4]) if len(cells) > 4 else None,
            ))

    if comp_table or bills:
        return DisclosureDetail(compensation=compensation, bills=bills)

    # ── Legacy format (<~2013) ────────────────────────────────────────────────
    salary_table = soup.find("table", id=lambda x: x and "grdvSalaryPaid" in (x or ""))
    if salary_table:
        total = 0.0
        for row in salary_table.find_all("tr"):
            cells = [td.get_text(strip=True) for td in row.find_all("td")]
            if len(cells) >= 2 and "Total" not in cells[0]:
                amt = _parse_amount(cells[1])
                if amt:
                    total += amt
        if total:
            compensation.append(Compensation(client_name=LEGACY_TOTAL_CLIENT, amount=total))

    act_table = soup.find("table", id=lambda x: x and x.endswith("grdvActivities"))
    if act_table:
        all_rows = act_table.find_all("tr")
        headers = [th.get_text(strip=True)
                   for th in (all_rows[0].find_all(["th", "td"]) if all_rows else [])]

        if headers and "Activity" in headers[0]:
            # 6-col entity layout has Lobbyist as second header
            if len(headers) >= 2 and "Lobbyist" in headers[1]:
                bill_col, pos_col, client_col = 0, 2, 4
            else:
                bill_col, pos_col, client_col = 0, 1, 3
        else:
            bill_col, pos_col, client_col = 1, None, 3

        chamber_map = {"H": "House Bill", "S": "Senate Bill",
                       "HD": "House Docket", "SD": "Senate Docket"}
        skip = {"Activity or Bill No and Title", "N/A", "None", "", "Total amount"}

        for row in all_rows[1:]:
            cells = [td.get_text(strip=True) for td in row.find_all("td")]
            if len(cells) <= max(bill_col, client_col):
                continue
            bill_cell = cells[bill_col]
            if not bill_cell or bill_cell in skip:
                continue
            parts = bill_cell.split(None, 1)
            bill_no = parts[0]
            m = re.match(r"^([A-Z]+)(\d+)$", bill_no)
            if not m:
                continue
            prefix, number = m.group(1), m.group(2)
            chamber = chamber_map.get(prefix, "Other")
            bill_id = construct_bill_id(chamber, number)
            bills.append(BillActivity(
                client_name=cells[client_col] if len(cells) > client_col else "",
                chamber=chamber,
                raw_bill_number=number,
                bill_id=bill_id,
                activity_title=parts[1] if len(parts) > 1 else "",
                position=cells[pos_col] if pos_col is not None and len(cells) > pos_col else "",
                amount=None,
            ))

    return DisclosureDetail(compensation=compensation, bills=bills)
