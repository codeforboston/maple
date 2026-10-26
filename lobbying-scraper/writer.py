"""Firestore document construction and write helpers.

Mirrors the data model in functions/src/lobbying/types.ts. All collection
names and field names must stay in sync with that file.
"""

from __future__ import annotations

import json
import re
import time
import urllib.parse
from datetime import datetime, timezone

from google.api_core.exceptions import GoogleAPICallError
from google.cloud import firestore
from normalize import normalize_entity_name
from portal import (
    BillActivity,
    Compensation,
    DisclosureDetail,
    DisclosureMeta,
    Registration,
    RegistrationParty,
    filing_id,
    registrant_id,
    registration_id,
    resolve_filer,
    year_to_general_court,
)

REGISTRANTS_COLLECTION = "lobbyingRegistrants"
REGISTRATIONS_COLLECTION = "lobbyingRegistrations"
FILINGS_COLLECTION = "lobbyingFilings"
SCRAPER_DOC = "scrapers/lobbying"
PROCESSED_URLS_COLLECTION = "processedUrls"
SUMMARY_CACHE_COLLECTION = "summaryCache"
BACKFILL_DOC = "scrapers/lobbyingBackfill"
BACKFILL_URLS_COLLECTION = "processedUrls"
STATS_COLLECTION = "lobbyingMeta"
STATS_DOC_ID = "stats"

# Sentinel clientName used for pre-2013 legacy filings where compensation is
# reported as a single total rather than broken down per client. Must match
# LEGACY_TOTAL_CLIENT in functions/src/lobbying/types.ts.
LEGACY_TOTAL_CLIENT = "_total_salary_"


def _counts_as_bill(bill_id: str | None) -> bool:
    """A chamber prefix and a bill number from 1 up. Filers enter 0 for
    activity on no bill yet ("N/A", "a bill to be filed next session"), so
    H0/S0 aren't bills; H1-H9 are (H1 is the House budget)."""
    return bool(bill_id and re.fullmatch(r"[A-Z]+[1-9][0-9]*", bill_id))


def _is_legacy_total_client(name: str | None, name_norm: str | None) -> bool:
    if not name_norm or name_norm == LEGACY_TOTAL_CLIENT:
        return True
    if name == LEGACY_TOTAL_CLIENT:
        return True
    lc = (name or "").lower()
    return "total salaries" in lc or "total salary" in lc


# The portal's client for a period in which a lobbyist had no client
# ("Client: No client", $0.00, activity "N/A", though some report bills).
# Not an organization: it gets a client summary and list row (marked
# placeholder) listing those lobbyists, but no client or organization count.
NO_CLIENT = "NO CLIENT"


def _doc_id_for_norm(name_norm: str) -> str:
    """Firestore doc ID for a normalized name — matches JS encodeURIComponent()
    exactly (same unreserved character set: alnum, - _ . ! ~ * ' ( )), so the
    frontend can look up a single summary doc directly via
    encodeURIComponent(clientNameNorm) without scanning the whole
    subcollection.
    """
    return urllib.parse.quote(name_norm, safe="!*'()")

# compute_stats() streams the full filings/registrants collections, which at
# MAPLE's current scale (300K+ docs) can exceed Firestore's server-side query
# timeout. Batching with an explicit cursor keeps each individual RPC small
# and fast; retry=None disables the client library's built-in stream-retry
# (which has a version-skew bug that crashes instead of retrying), and the
# manual retry loop below just re-issues a fresh, small query on failure
# instead of trying to resume a broken stream.
_BATCH_SIZE = 50000
_MAX_RETRIES = 3


def _iter_collection(db: firestore.Client, collection_name: str):
    """Yield every document in a collection via small, cursor-paginated reads."""
    coll_ref = db.collection(collection_name)
    last_doc = None

    while True:
        query = coll_ref.order_by("__name__").limit(_BATCH_SIZE)
        if last_doc is not None:
            query = query.start_after(last_doc)

        for attempt in range(_MAX_RETRIES):
            try:
                batch = list(query.stream(retry=None))
                break
            except GoogleAPICallError as e:
                if attempt == _MAX_RETRIES - 1:
                    raise
                print(
                    f"  batch read failed ({e}); retrying "
                    f"({attempt + 1}/{_MAX_RETRIES})…"
                )
                time.sleep(2**attempt)

        if not batch:
            return

        yield from batch
        last_doc = batch[-1]

        if len(batch) < _BATCH_SIZE:
            return


def _now() -> datetime:
    return datetime.now(tz=timezone.utc)


def _normalize_position(raw: str | None) -> str:
    if not raw:
        return "none"
    s = raw.lower().strip()
    if s.startswith("support"):
        return "support"
    if s.startswith("oppose") or s.startswith("against"):
        return "oppose"
    if s.startswith("neutral") or s.startswith("monitor"):
        return "neutral"
    return "none"


def _party_norm(party: dict) -> str:
    """A registration party's normalized name (older docs may lack nameNorm)."""
    return party.get("nameNorm") or normalize_entity_name(party["name"])


# The per-session fields a Clients list row carries (lobbyingMeta/
# clientList_{gc}; ClientListEntry in components/db/lobbying.ts).
_CLIENT_LIST_FIELDS = ("bills", "compensation", "individuals", "firmAgents",
                       "inHouseLobbyists", "hiredFirms", "firmsWithoutAgents")


def _period_key(filing: dict) -> str:
    """The filing's half-year as "YYYY-06-30" / "YYYY-12-31" (from periodEnd),
    else its year: the Bill page's period keys, which sort as strings."""
    end = filing.get("periodEnd") or ""
    if len(end) >= 7 and end[:4].isdigit():
        return f"{end[:4]}-{'06-30' if int(end[5:7]) <= 6 else '12-31'}"
    return str(filing.get("year", ""))


def _prune_stale(db: firestore.Client, coll_ref, keep: set[str]) -> int:
    """Delete docs in a summary subcollection that this run didn't write.
    Summaries are fully regenerated each run, so a doc left over from an
    earlier run (a firm or client that no longer has records) is stale and
    would otherwise keep appearing in the lists."""
    stale = [ref for ref in coll_ref.list_documents() if ref.id not in keep]
    batch = db.batch()
    for i, ref in enumerate(stale, 1):
        batch.delete(ref)
        if i % 400 == 0:
            batch.commit()
            batch = db.batch()
    if len(stale) % 400:
        batch.commit()
    return len(stale)


def compute_stats(db: firestore.Client) -> None:
    """Recompute and write the lobbyingMeta/stats singleton from raw collections."""
    print("\nRecomputing stats…")
    bills: set[str] = set()
    courts: set[int] = set()
    filings_by_year: dict[str, int] = {}
    entity_filing_counts: dict[str, int] = {}
    client_filing_counts: dict[str, int] = {}
    bill_summaries: dict[int, dict[str, dict]] = {}
    bill_client_sets: dict[int, dict[str, set]] = {}
    bill_entity_sets: dict[int, dict[str, set]] = {}
    total_filings = 0
    # Per-session (general court) tallies behind the session filter on the
    # Lobbyists and Clients lists: entity/client norm -> court -> value.
    entity_court_filings: dict[str, dict[int, int]] = {}
    client_court_filings: dict[str, dict[int, int]] = {}
    entity_court_clients: dict[str, dict[int, set]] = {}
    client_court_entities: dict[str, dict[int, set]] = {}
    client_court_comp: dict[str, dict[int, float]] = {}
    # Organizations (client norms) per normalized position on each bill:
    # gc -> bill -> position -> set. An org with two positions is in both.
    bill_pos_clients: dict[int, dict[str, dict[str, set]]] = {}
    # Distinct bills and filers per client per session: client norm -> gc -> set.
    client_court_bills: dict[str, dict[int, set]] = {}
    client_court_filers: dict[str, dict[int, set]] = {}
    # Each organization's latest reporting period on a bill and the positions
    # it reported then: gc -> bill -> client norm -> [period key, positions].
    # Counted once per organization below, as the Bill page does.
    bill_org_latest: dict[int, dict[str, dict[str, list]]] = {}
    # Clients with filings per session (the overview's key figures).
    court_clients: dict[int, set] = {}
    # Filings per year, and how many carry their reporting window; logged so
    # a parser regression shows up in the job log.
    filings_with_period: dict[str, int] = {}

    for doc in _iter_collection(db, FILINGS_COLLECTION):
        d = doc.to_dict()
        year = str(d.get("year", ""))
        gc = d.get("generalCourt")
        bill_id = d.get("billId")
        cn = d.get("clientNameNorm")
        en = d.get("entityNameNorm")
        # The client, unless it's the legacy total row; and the client when
        # it's an organization, so not "No client" either. Both count toward
        # filings; only an organization counts toward client and org counts.
        client = cn if cn and not _is_legacy_total_client(d.get("clientName"), cn) else None
        org = client if client != NO_CLIENT else None
        if _counts_as_bill(bill_id) and gc:
            bills.add(f"{gc}/{bill_id}")
            pos = _normalize_position(d.get("position"))
            if gc not in bill_summaries:
                bill_summaries[gc] = {}
                bill_client_sets[gc] = {}
                bill_entity_sets[gc] = {}
            if bill_id not in bill_summaries[gc]:
                bill_summaries[gc][bill_id] = {
                    "total": 0,
                    "support": 0,
                    "oppose": 0,
                    "neutral": 0,
                    "none": 0,
                    "title": d.get("activityTitle") or "",
                    "clients": 0,
                    "lobbyists": 0,
                    "orgSupport": 0,
                    "orgOppose": 0,
                    "orgNeutral": 0,
                    "orgLatestSupport": 0,
                    "orgLatestOppose": 0,
                    "orgLatestNeutral": 0,
                    "orgLatestMultiple": 0,
                }
                bill_client_sets[gc][bill_id] = set()
                bill_entity_sets[gc][bill_id] = set()
            bill_summaries[gc][bill_id]["total"] += 1
            bill_summaries[gc][bill_id][pos] += 1
            if client:
                client_court_bills.setdefault(cn, {}).setdefault(gc, set()).add(bill_id)
            if org:
                bill_client_sets[gc][bill_id].add(cn)
                if pos != "none":
                    by_pos = bill_pos_clients.setdefault(gc, {}).setdefault(bill_id, {})
                    by_pos.setdefault(pos, set()).add(cn)
                key = _period_key(d)
                orgs = bill_org_latest.setdefault(gc, {}).setdefault(bill_id, {})
                slot = orgs.get(cn)
                if slot is None:
                    slot = orgs[cn] = [key, set()]
                elif key > slot[0]:
                    slot[0], slot[1] = key, set()
                if key == slot[0]:
                    slot[1].add(pos)
            if en:
                bill_entity_sets[gc][bill_id].add(en)
        if gc:
            courts.add(gc)
        if year:
            filings_by_year[year] = filings_by_year.get(year, 0) + 1
            if d.get("periodEnd"):
                filings_with_period[year] = filings_with_period.get(year, 0) + 1
        total_filings += 1
        if org and gc:
            court_clients.setdefault(gc, set()).add(cn)
        if client and gc and en:
            client_court_filers.setdefault(cn, {}).setdefault(gc, set()).add(en)
        if en:
            entity_filing_counts[en] = entity_filing_counts.get(en, 0) + 1
            if gc:
                by_court = entity_court_filings.setdefault(en, {})
                by_court[gc] = by_court.get(gc, 0) + 1
        if client:
            client_filing_counts[cn] = client_filing_counts.get(cn, 0) + 1
            if gc:
                by_court = client_court_filings.setdefault(cn, {})
                by_court[gc] = by_court.get(gc, 0) + 1

    for gc, bills_map in bill_summaries.items():
        for bill_id, counts in bills_map.items():
            counts["clients"] = len(bill_client_sets.get(gc, {}).get(bill_id, set()))
            counts["lobbyists"] = len(bill_entity_sets.get(gc, {}).get(bill_id, set()))
            by_pos = bill_pos_clients.get(gc, {}).get(bill_id, {})
            counts["orgSupport"] = len(by_pos.get("support", ()))
            counts["orgOppose"] = len(by_pos.get("oppose", ()))
            counts["orgNeutral"] = len(by_pos.get("neutral", ()))
            # Each organization once, by what it reported in its latest
            # period: one position counts under it, more than one as
            # multiple; "none" only counts when it's alone, and isn't shown.
            for _, positions in bill_org_latest.get(gc, {}).get(bill_id, {}).values():
                reported = positions - {"none"}
                if len(reported) > 1:
                    counts["orgLatestMultiple"] += 1
                elif reported:
                    counts["orgLatest" + next(iter(reported)).capitalize()] += 1

    client_norms: set[str] = set()
    spend_by_year: dict[str, float] = {}
    # Entities with disclosures of their own (vs. only a registration, e.g. a
    # lobbyist whose firm files for them).
    filer_norms: set[str] = set()

    # Per-client and per-firm rollups, computed here (over the full,
    # paginated registrants scan) instead of client-side in the frontend,
    # which previously fetched only the first 2,000 of 25,000+ registrant
    # docs (Firestore query limit) — silently showing an incomplete client
    # and firm list. See pages/lobbying/clients/index.tsx and
    # pages/lobbying/firms/index.tsx.
    client_summaries: dict[str, dict] = {}
    firm_summaries: dict[str, dict] = {}
    # Reported paid per session, on the same basis as spendByYear.
    paid_by_court: dict[int, float] = {}
    # People and entities on a disclosure in each session: the filer, plus
    # the lobbyists a firm's disclosure names.
    active_by_court: dict[int, set] = {}
    # Agents each entity names on a client's activity blocks:
    # client norm -> gc -> entity norm -> set of agent norms.
    client_court_agents: dict[str, dict[int, dict[str, set]]] = {}
    # Firm disclosures per year from 2014, and how many name agents per
    # client; logged so a parser regression shows up in the job log.
    firm_docs_by_year: dict[int, list[int]] = {}

    for doc in _iter_collection(db, REGISTRANTS_COLLECTION):
        d = doc.to_dict()
        year = d.get("year")
        year_str = str(year) if year is not None else ""
        entity_name = d.get("entityName")
        entity_norm = d.get("entityNameNorm")
        reg_type = d.get("regType")
        clients = d.get("clients", [])
        court = year_to_general_court(year) if year is not None else None
        client_lobbyists = d.get("clientLobbyists") or {}

        if court is not None:
            active = active_by_court.setdefault(court, set())
            active.update(
                d.get("lobbyistsNorm")
                or [normalize_entity_name(n) for n in d.get("lobbyists") or []]
            )
            if entity_norm:
                active.add(entity_norm)
                for cn, names in client_lobbyists.items():
                    client_court_agents.setdefault(cn, {}).setdefault(court, {}).setdefault(
                        entity_norm, set()
                    ).update(normalize_entity_name(n) for n in names)
        if reg_type == "Employer" and year is not None and year >= 2014:
            tally = firm_docs_by_year.setdefault(year, [0, 0])
            tally[0] += 1
            tally[1] += bool(client_lobbyists)

        if entity_norm:
            firm = firm_summaries.setdefault(
                entity_norm,
                {
                    "entityName": entity_name or entity_norm,
                    "entityNameNorm": entity_norm,
                    "regType": reg_type or "",
                    "years": set(),
                    "clientNorms": set(),
                    "lobbyists": set(),
                },
            )
            if year is not None:
                firm["years"].add(year)
            firm["lobbyists"].update(d.get("lobbyists") or [])
            if reg_type:
                firm["regType"] = reg_type

        for c in clients:
            norm = c.get("clientNameNorm")
            name = c.get("clientName")
            comp = c.get("compensation")

            if comp is not None and year_str:
                spend_by_year[year_str] = spend_by_year.get(year_str, 0) + comp
                paid_by_court[court] = paid_by_court.get(court, 0) + comp

            if _is_legacy_total_client(name, norm):
                continue
            if court is not None:
                if comp is not None:
                    by_court = client_court_comp.setdefault(norm, {})
                    by_court[court] = by_court.get(court, 0) + comp
                if entity_norm:
                    client_court_entities.setdefault(norm, {}).setdefault(court, set()).add(entity_norm)
            # "No client" gets a summary, but no client count of its own or
            # of the lobbyists reporting it.
            if norm != NO_CLIENT:
                client_norms.add(norm)
                if entity_norm:
                    if court is not None:
                        entity_court_clients.setdefault(entity_norm, {}).setdefault(court, set()).add(norm)
                    # A set, not a running sum of len(clients): a registrant
                    # can now have multiple docs (one per filing period) for
                    # the same entity+year, and this is shown to users as
                    # "Clients represented" — it must count distinct clients,
                    # not filing periods or repeat appearances across years.
                    firm_summaries[entity_norm]["clientNorms"].add(norm)

            cs = client_summaries.setdefault(
                norm,
                {
                    "clientName": name or norm,
                    "clientNameNorm": norm,
                    "totalCompensation": None,
                    "registrantCount": 0,
                    "firms": {},
                },
            )
            if comp is not None:
                cs["totalCompensation"] = (cs["totalCompensation"] or 0) + comp

            if entity_norm:
                fb = cs["firms"].setdefault(
                    entity_norm,
                    {
                        "entityName": entity_name or entity_norm,
                        "entityNameNorm": entity_norm,
                        "compensation": None,
                        "years": set(),
                    },
                )
                if comp is not None:
                    fb["compensation"] = (fb["compensation"] or 0) + comp
                if year is not None:
                    fb["years"].add(year)

        if entity_norm:
            filer_norms.add(entity_norm)

    # Registrations list every registered lobbyist and firm, including people
    # who never file a disclosure themselves because their firm files for them.
    # The overview's "Individual lobbyists" counts each registered person once.
    registered_individuals: set[str] = set()
    latest_registration: dict[str, tuple[int, str]] = {}
    # Registered people and entities per session, for the overview's counts.
    registered_by_court: dict[str, dict[int, set]] = {"Lobbyist": {}, "Employer": {}}
    # (lobbyist norm, gc) -> norms of the organizations they're staff of that
    # session: the entities employing them, or, for a lobbyist registered with
    # no employing entity, the client(s) they list (taken as their employer).
    lobbyist_orgs: dict[tuple[str, int], set] = {}
    # Per client: earliest employment start; the latest year's page of the
    # client's own (every registration listing a client links to it, a new
    # page each year); and the latest registration listing them, as (year,
    # registration page), whose page stands in when no client page is known.
    client_first_start: dict[str, str] = {}
    client_latest_page: dict[str, tuple[int, str]] = {}
    client_latest_registration: dict[str, tuple[int, str]] = {}
    for doc in _iter_collection(db, REGISTRATIONS_COLLECTION):
        d = doc.to_dict()
        norm = d.get("nameNorm")
        year = d.get("year")
        reg_type = d.get("regType") or ""
        if not norm:
            continue
        if reg_type == "Lobbyist":
            registered_individuals.add(norm)
        gc = year_to_general_court(year) if year is not None else None
        if gc is not None and reg_type in registered_by_court:
            registered_by_court[reg_type].setdefault(gc, set()).add(norm)
        entry = firm_summaries.setdefault(
            norm,
            {
                "entityName": d.get("name") or norm,
                "entityNameNorm": norm,
                "regType": reg_type,
                "years": set(),
                "clientNorms": set(),
                "lobbyists": set(),
            },
        )
        if year is not None:
            entry["years"].add(year)
        entry["lobbyists"].update(p["name"] for p in d.get("lobbyists", []) if p.get("name"))
        # One entry per employing entity (an entity's name is often spelled
        # differently from year to year), shown with its latest spelling.
        employers = entry.setdefault("employers", {})
        for p in d.get("employers", []):
            if not p.get("name"):
                continue
            key = _party_norm(p)
            if key not in employers or (year or 0) >= employers[key][0]:
                employers[key] = (year or 0, p["name"])
            if reg_type == "Lobbyist" and gc is not None:
                lobbyist_orgs.setdefault((norm, gc), set()).add(key)
        urls = sorted(d.get("sourceUrls") or [])
        # Lobbyists working for a firm register under it and list no clients;
        # an individual account may have at most one client, normally the
        # organization employing them. A single-client contractor looks the
        # same in the data and is counted as in-house too.
        staff_of_clients = reg_type == "Lobbyist" and not d.get("employers") and gc is not None
        # Tuple order prefers, within a year, a registration with a page.
        latest = (year, urls[0] if urls else "")
        for p in d.get("clients", []):
            if not p.get("name"):
                continue
            key = _party_norm(p)
            # Not an organization: no one is its staff, and it has no
            # registration dates or page of its own.
            if key == NO_CLIENT:
                continue
            if staff_of_clients:
                lobbyist_orgs.setdefault((norm, gc), set()).add(key)
            start = p.get("startDate")
            if start and (key not in client_first_start or start < client_first_start[key]):
                client_first_start[key] = start
            if year is not None and latest > client_latest_registration.get(key, (0, "")):
                client_latest_registration[key] = latest
            page = p.get("sourceUrl")
            if year is not None and page and (year, page) > client_latest_page.get(key, (0, "")):
                client_latest_page[key] = (year, page)
        if urls and year is not None and year >= latest_registration.get(norm, (0, ""))[0]:
            latest_registration[norm] = (year, urls[0])
        # Per-year registration details for the profile page (rolled up here so
        # the frontend reads one public summary doc, not the raw collection).
        entry.setdefault("registrations", []).append({
            "year": year,
            "sourceUrl": urls[0] if urls else None,
            "employers": [
                {"name": p["name"], "nameNorm": p.get("nameNorm")}
                for p in d.get("employers", []) if p.get("name")
            ],
            "lobbyists": [
                {"name": p["name"], "nameNorm": p.get("nameNorm")}
                for p in d.get("lobbyists", []) if p.get("name")
            ],
        })
    total_lobbyists = len(registered_individuals)

    # The overview's "registered lobbyists" and "firms & entities": registered
    # in the session and on at least one disclosure in it.
    court_lobbyists, court_entities = (
        {gc: norms & active_by_court.get(gc, set()) for gc, norms in registered_by_court[t].items()}
        for t in ("Lobbyist", "Employer")
    )

    def is_in_house(entity: str, client: str, gc: int) -> bool:
        # The client's own staff: the client filing for itself, or a lobbyist
        # whose registration that session names the client as their employer
        # (from 2019) or, with no employing entity, as their client.
        return entity == client or client in lobbyist_orgs.get((entity, gc), ())

    # In-house filers per client and session, for every client with filings.
    # The summaries' inHouseCount and the inHouseFilers_{gc} docs both read it.
    client_court_in_house: dict[str, dict[int, set]] = {
        cn: {gc: {en for en in filers if is_in_house(en, cn, gc)} for gc, filers in by_court.items()}
        for cn, by_court in client_court_filers.items()
    }
    in_house_by_court: dict[int, dict[str, list[str]]] = {}
    for cn, by_court in client_court_in_house.items():
        for gc, in_house in by_court.items():
            if in_house:
                in_house_by_court.setdefault(gc, {})[cn] = sorted(in_house)

    for cs in client_summaries.values():
        # A set of distinct firms (cs["firms"] is already keyed by
        # entityNameNorm), not a running per-doc count — same period-doc
        # inflation concern as firm clientCount above. Labeled "Lobbyists" on
        # the clients page.
        cs["registrantCount"] = len(cs["firms"])
        norm = cs["clientNameNorm"]
        filings_by_court = client_court_filings.get(norm, {})
        entities_by_court = client_court_entities.get(norm, {})
        comp_by_court = client_court_comp.get(norm, {})
        bills_by_court = client_court_bills.get(norm, {})
        filers_by_court = client_court_filers.get(norm, {})
        agents_by_court = client_court_agents.get(norm, {})
        cs["courts"] = {}
        all_in_house: set[str] = set()
        all_individuals: set[str] = set()
        # Every lobbyist or entity on the client's disclosures, filings or
        # agent blocks is either its own staff or hired, counted from one set
        # so the two always add up (for sessions without agent counts).
        all_in_house_units: set[str] = set()
        all_hired_units: set[str] = set()
        for gc in (
            set(filings_by_court) | set(entities_by_court) | set(comp_by_court)
            | set(bills_by_court) | set(filers_by_court)
        ):
            in_house_filers = client_court_in_house.get(norm, {}).get(gc, set())
            all_in_house |= in_house_filers
            # People lobbying for the client: individual registrants and the
            # agents each entity names on the client's activity blocks.
            agents = agents_by_court.get(gc, {})
            in_house_people: set[str] = set()
            hired_people: set[str] = set()
            in_house_units: set[str] = set()
            # Hired firms and hired individual lobbyists; an individual counts
            # as a one-person firm (and as its own agent in firmAgents).
            hired_units: set[str] = set()
            # Hired firms naming no agents for the client, so the people total
            # (individuals + these) isn't short by the firms with no names.
            firms_without_agents: set[str] = set()
            for en in set(entities_by_court.get(gc, ())) | filers_by_court.get(gc, set()) | set(agents):
                people = set(agents.get(en, ()))
                is_individual = firm_summaries.get(en, {}).get("regType") == "Lobbyist"
                if is_individual:
                    people.add(en)
                if is_in_house(en, norm, gc):
                    in_house_people.update(people)
                    in_house_units.add(en)
                else:
                    hired_people.update(people)
                    hired_units.add(en)
                    if not is_individual and not people:
                        firms_without_agents.add(en)
            all_in_house_units |= in_house_units
            all_hired_units |= hired_units
            firm_agents = hired_people - in_house_people
            individuals = in_house_people | firm_agents
            all_individuals |= individuals
            cs["courts"][str(gc)] = {
                "filings": filings_by_court.get(gc, 0),
                "lobbyistCount": len(entities_by_court.get(gc, ())),
                "compensation": comp_by_court.get(gc),
                "bills": len(bills_by_court.get(gc, ())),
                "inHouseCount": len(in_house_filers),
                "individuals": len(individuals),
                "firmAgents": len(firm_agents),
                "inHouseLobbyists": len(in_house_units),
                "hiredFirms": len(hired_units),
                "firmsWithoutAgents": len(firms_without_agents),
                # This client's entry in inHouseFilers_{gc}, so the Client
                # page needn't read every client's.
                "inHouseFilers": sorted(in_house_filers),
            }
        cs["inHouseCount"] = len(all_in_house)
        cs["individuals"] = len(all_individuals)
        cs["inHouseLobbyists"] = len(all_in_house_units)
        # In-house in any session wins, so no one is counted on both sides.
        cs["hiredFirms"] = len(all_hired_units - all_in_house_units)
        cs["firstRegistered"] = client_first_start.get(norm)
        last_year, last_url = client_latest_registration.get(norm, (None, ""))
        cs["lastRegisteredYear"] = last_year
        cs["registrationUrl"] = client_latest_page.get(norm, (None, ""))[1] or last_url or None
        if norm == NO_CLIENT:
            cs["placeholder"] = True
        for fb in cs["firms"].values():
            fb["years"] = sorted(fb["years"], reverse=True)
        cs["firms"] = sorted(
            cs["firms"].values(),
            key=lambda f: (-(max(f["years"]) if f["years"] else 0), f["entityNameNorm"]),
        )
    for fs in firm_summaries.values():
        fs["clientCount"] = len(fs.pop("clientNorms"))
        fs["years"] = sorted(fs["years"], reverse=True)
        # Lets the firms list find a firm by the name of a lobbyist it employs.
        fs["lobbyists"] = sorted(fs["lobbyists"])
        # Firms a lobbyist is registered under (from 2019, when individual
        # registrations name their employer).
        fs["employers"] = [
            name for _, name in sorted(fs.get("employers", {}).values(), key=lambda e: (-e[0], e[1]))
        ]
        fs["hasFilings"] = fs["entityNameNorm"] in filer_norms
        filings_by_court = entity_court_filings.get(fs["entityNameNorm"], {})
        clients_by_court = entity_court_clients.get(fs["entityNameNorm"], {})
        fs["courts"] = {
            str(gc): {
                "filings": filings_by_court.get(gc, 0),
                "clientCount": len(clients_by_court.get(gc, ())),
            }
            for gc in set(filings_by_court) | set(clients_by_court)
        }
        fs["sourceUrl"] = latest_registration.get(fs["entityNameNorm"], (0, None))[1]
        regs = sorted(fs.get("registrations", []), key=lambda r: -(r["year"] or 0))
        for r in regs:
            # Link a named person or firm only if it has an entry of its own.
            for p in r["employers"] + r["lobbyists"]:
                p["hasProfile"] = p["nameNorm"] in firm_summaries
        fs["registrations"] = regs

    stats = {
        "totalFilings": total_filings,
        # Field name kept for compatibility with deployed frontends; it holds
        # the count of distinct individual lobbyists.
        "totalRegistrants": total_lobbyists,
        "totalClients": len(client_norms),
        "totalBillsWithFilings": len(bills),
        "courtsWithData": sorted(courts),
        "spendByYear": spend_by_year,
        "filingsByYear": filings_by_year,
        # The overview's key figures for one session.
        "courts": {
            str(gc): {
                "bills": len(bill_summaries.get(gc, ())),
                "clients": len(court_clients.get(gc, ())),
                "lobbyists": len(court_lobbyists.get(gc, ())),
                "firms": len(court_entities.get(gc, ())),
                "paid": paid_by_court.get(gc, 0),
            }
            for gc in (
                set(bill_summaries) | set(court_clients) | set(court_lobbyists)
                | set(court_entities) | set(paid_by_court)
            )
        },
        "totalLobbyists": len(set().union(*court_lobbyists.values())),
        "totalEntities": len(set().union(*court_entities.values())),
    }
    # Full overwrite, not merge: a merge keeps map keys (e.g. a spendByYear
    # year) that this run no longer produces, so stale values never go away.
    db.collection(STATS_COLLECTION).document(STATS_DOC_ID).set(stats)
    db.collection(STATS_COLLECTION).document("entityFilingCounts").set(
        entity_filing_counts
    )
    db.collection(STATS_COLLECTION).document("clientFilingCounts").set(
        client_filing_counts
    )
    # One list doc per session for the Clients and Lobbyists list pages, so
    # their API routes read one document instead of every summary. Keyed by
    # normalized name; each row holds what the lists show, sort and search on.
    client_lists: dict[int, dict] = {}
    client_list_all: dict[str, dict] = {}
    for cs in client_summaries.values():
        norm = cs["clientNameNorm"]
        # Marks "No client", which the lists show but don't count.
        placeholder = {"placeholder": True} if cs.get("placeholder") else {}
        for gc, c in cs["courts"].items():
            client_lists.setdefault(int(gc), {})[norm] = {
                "name": cs["clientName"], **{k: c[k] for k in _CLIENT_LIST_FIELDS}, **placeholder
            }
        client_list_all[norm] = {
            "name": cs["clientName"],
            "bills": sum(c["bills"] for c in cs["courts"].values()),
            "compensation": cs["totalCompensation"],
            "inHouseLobbyists": cs["inHouseLobbyists"],
            "hiredFirms": cs["hiredFirms"],
            **placeholder,
        }
    # A lobbyist or entity is in a session when it registered in one of the
    # session's years, as the Lobbyists list filters. No all-sessions doc: at
    # ~2 MB it would pass Firestore's 1 MiB limit, so that view reads
    # firmSummaries.
    firm_lists: dict[int, dict] = {}
    for fs in firm_summaries.values():
        for gc in {year_to_general_court(y) for y in fs["years"]}:
            c = fs["courts"].get(str(gc), {})
            firm_lists.setdefault(gc, {})[fs["entityNameNorm"]] = {
                "name": fs["entityName"],
                "regType": fs["regType"],
                "years": fs["years"],
                "clientCount": c.get("clientCount", 0),
                "filings": c.get("filings", 0),
                "totalFilings": entity_filing_counts.get(fs["entityNameNorm"]),
                "lobbyists": fs["lobbyists"],
                "employers": fs["employers"],
                "hasFilings": fs["hasFilings"],
            }

    # Per-session docs (inHouseFilers_{gc}: {client norm: [in-house filer
    # norms]}; the two lists) and clientList_all, each a full overwrite so a
    # row no longer present drops out; a session with no rows this run keeps
    # no stale doc. Sizes are logged against Firestore's 1 MiB doc limit.
    by_session = {"inHouseFilers": in_house_by_court, "clientList": client_lists, "firmList": firm_lists}
    docs = {f"{prefix}_{gc}": rows for prefix, by_gc in by_session.items() for gc, rows in by_gc.items()}
    docs["clientList_all"] = client_list_all
    doc_sizes: dict[str, tuple[int, int]] = {}
    for name, rows in docs.items():
        db.collection(STATS_COLLECTION).document(name).set(rows)
        doc_sizes[name] = (len(rows), len(json.dumps(rows)))
    sessions = courts.union(*by_session.values())
    for prefix, by_gc in by_session.items():
        for gc in sessions - set(by_gc):
            db.collection(STATS_COLLECTION).document(f"{prefix}_{gc}").delete()
    pruned = 0
    for gc, bills_map in bill_summaries.items():
        # One small doc per bill, not one JSON blob per court: a court's blob
        # eventually exceeds Firestore's 1MB field-size limit as its session
        # accumulates filings (hit at 1,057KB for court 194 with ~5,600
        # bills). Per-bill docs have no such ceiling.
        parent_ref = db.collection(STATS_COLLECTION).document(f"billSummaries_{gc}")
        parent_ref.set(
            {"billCount": len(bills_map), "updatedAt": _now().isoformat()}
        )
        bills_coll = parent_ref.collection("bills")
        batch = db.batch()
        count = 0
        for bill_id, counts in bills_map.items():
            batch.set(bills_coll.document(bill_id), counts)
            count += 1
            if count % 400 == 0:
                batch.commit()
                batch = db.batch()
        if count % 400 != 0:
            batch.commit()
        pruned += _prune_stale(db, bills_coll, set(bills_map))

    # Client and firm summaries: same one-small-doc-per-item subcollection
    # pattern as billSummaries above (avoids the 1MB per-document/field
    # limit — at ~5,300 clients and ~4,800 firms this is already close to
    # that ceiling as a single blob/map).
    client_parent = db.collection(STATS_COLLECTION).document("clientSummaries")
    client_parent.set(
        {"count": len(client_summaries), "updatedAt": _now().isoformat()}
    )
    client_coll = client_parent.collection("clients")
    batch = db.batch()
    count = 0
    for norm, cs in client_summaries.items():
        batch.set(client_coll.document(_doc_id_for_norm(norm)), cs)
        count += 1
        if count % 400 == 0:
            batch.commit()
            batch = db.batch()
    if count % 400 != 0:
        batch.commit()
    pruned += _prune_stale(db, client_coll, {_doc_id_for_norm(n) for n in client_summaries})

    firm_parent = db.collection(STATS_COLLECTION).document("firmSummaries")
    firm_parent.set({"count": len(firm_summaries), "updatedAt": _now().isoformat()})
    firm_coll = firm_parent.collection("firms")
    batch = db.batch()
    count = 0
    for norm, fs in firm_summaries.items():
        batch.set(firm_coll.document(_doc_id_for_norm(norm)), fs)
        count += 1
        if count % 400 == 0:
            batch.commit()
            batch = db.batch()
    if count % 400 != 0:
        batch.commit()
    pruned += _prune_stale(db, firm_coll, {_doc_id_for_norm(n) for n in firm_summaries})

    print(
        f"  stats written: {total_filings} filings, "
        f"{total_lobbyists} individual lobbyists, {len(client_norms)} clients, "
        f"{len(entity_filing_counts)} entities, {len(client_filing_counts)} client norms, "
        f"bill summaries for courts {sorted(bill_summaries.keys())}, "
        f"{len(client_summaries)} client summaries, {len(firm_summaries)} firm summaries, "
        f"{pruned} stale summary docs removed"
    )
    # Coverage of the parsed fields that fail silently, and the in-house docs'
    # size against Firestore's 1MB document limit.
    for year in sorted(filings_by_year):
        print(f"  {year}: {filings_with_period.get(year, 0)}/{filings_by_year[year]} filings have periodEnd")
    for year, (total, named) in sorted(firm_docs_by_year.items()):
        print(f"  {year}: {named}/{total} firm disclosures name agents per client")
    for name, (rows, size) in sorted(doc_sizes.items()):
        warn = " (nearing Firestore's 1 MiB doc limit)" if size > 900 * 1024 else ""
        print(f"  {name}: {rows} rows, ~{size // 1024} KB{warn}")


def registrant_doc(
    meta: DisclosureMeta, detail: DisclosureDetail
) -> tuple[str, dict] | None:
    """Build (doc_id, fields) for the registrant that filed this disclosure,
    excluding disclosureUrls and fetchedAt. None if it can't be attributed."""
    meta = resolve_filer(meta, detail)
    if not meta.entity_name or meta.year is None:
        return None

    doc_id = registrant_id(meta.entity_name, meta.year, detail.period_start)
    clients = [
        {
            "clientName": c.client_name,
            "clientNameNorm": normalize_entity_name(c.client_name),
            "compensation": c.amount,
        }
        for c in detail.compensation
    ]
    # Agents named on each client's activity block (2014+). Two spellings of
    # a client can normalize alike, so merge rather than overwrite.
    client_lobbyists: dict[str, list[str]] = {}
    for client, names in detail.client_lobbyists.items():
        key = normalize_entity_name(client)
        if not key:  # Firestore rejects empty map keys
            continue
        merged = client_lobbyists.setdefault(key, [])
        merged.extend(n for n in names if n not in merged)

    data = {
        "registrantId": doc_id,
        "entityName": meta.entity_name,
        "entityNameNorm": normalize_entity_name(meta.entity_name),
        "year": meta.year,
        "generalCourt": year_to_general_court(meta.year),
        "regType": meta.reg_type,
        "clients": clients,
        "legacyTotalCompensation": detail.legacy_total_compensation,
        "periodStart": detail.period_start,
        "periodEnd": detail.period_end,
        "lobbyists": detail.lobbyists,
        "lobbyistsNorm": [normalize_entity_name(n) for n in detail.lobbyists],
        "clientLobbyists": client_lobbyists,
    }
    return doc_id, data


def write_registrant(
    db: firestore.Client,
    meta: DisclosureMeta,
    detail: DisclosureDetail,
    disc_url: str,
) -> None:
    """Upsert the LobbyingRegistrant document for whoever filed this disclosure."""
    built = registrant_doc(meta, detail)
    if built is None:
        return
    doc_id, data = built
    data["disclosureUrls"] = firestore.ArrayUnion([disc_url])
    data["fetchedAt"] = _now()
    # Replace each field outright (merge=True would keep map keys such as a
    # client an amendment dropped from clientLobbyists), but keep the union
    # of disclosure URLs, which the migration reads back.
    db.collection(REGISTRANTS_COLLECTION).document(doc_id).set(data, merge=list(data))


def _party(p: RegistrationParty) -> dict:
    return {
        "name": p.name,
        "nameNorm": normalize_entity_name(p.name),
        "sourceUrl": p.url,
        "amount": p.amount,
        "startDate": p.start_date,
        "endDate": p.end_date,
        "purpose": p.purpose,
    }


def registration_doc(reg: Registration) -> tuple[str, dict]:
    """Build (doc_id, fields) for a registration, excluding sourceUrls and
    fetchedAt (merged by the caller)."""
    doc_id = registration_id(reg.name, reg.year, reg.reg_type)
    return doc_id, {
        "registrationId": doc_id,
        "name": reg.name,
        "nameNorm": normalize_entity_name(reg.name),
        "year": reg.year,
        "regType": reg.reg_type,
        "lobbyists": [_party(p) for p in reg.lobbyists],
        "employers": [_party(p) for p in reg.employers],
        "clients": [_party(p) for p in reg.clients],
        "disclosureUrls": reg.disclosure_urls,
    }


def write_registration(db: firestore.Client, reg: Registration) -> None:
    """Upsert a LobbyingRegistration document from a registration page."""
    doc_id, data = registration_doc(reg)
    data["sourceUrls"] = firestore.ArrayUnion([reg.url])
    data["fetchedAt"] = _now()
    db.collection(REGISTRATIONS_COLLECTION).document(doc_id).set(data, merge=True)


def write_filings(
    db: firestore.Client,
    meta: DisclosureMeta,
    detail: DisclosureDetail,
    disc_url: str,
) -> int:
    """Batch-write LobbyingFiling documents. Returns the number written."""
    meta = resolve_filer(meta, detail)
    if not meta.entity_name or meta.year is None or not detail.bills:
        return 0

    gc = year_to_general_court(meta.year)
    entity_name = meta.entity_name
    entity_norm = normalize_entity_name(entity_name)
    now = _now()

    batch = db.batch()
    count = 0

    for bill in detail.bills:
        fid = filing_id(
            entity_name,
            bill.client_name,
            bill.chamber,
            bill.bill_id,
            gc,
            bill.position,
            detail.period_start,
        )
        ref = db.collection(FILINGS_COLLECTION).document(fid)
        doc = {
            "filingId": fid,
            "entityName": entity_name,
            "entityNameNorm": entity_norm,
            "clientName": bill.client_name,
            "clientNameNorm": normalize_entity_name(bill.client_name),
            "year": meta.year,
            "generalCourt": gc,
            "chamber": bill.chamber,
            "billId": bill.bill_id,
            "activityTitle": bill.activity_title,
            "position": bill.position,
            "amount": bill.amount,
            # The SoS disclosure page this activity was reported on, and the
            # reporting period it covers (a firm files twice a year, so one
            # position can appear on two disclosures in the same year).
            "disclosureUrl": disc_url,
            "periodStart": detail.period_start,
            "periodEnd": detail.period_end,
            "fetchedAt": now,
        }
        batch.set(ref, doc)
        count += 1

        # Firestore batch limit is 500 writes
        if count % 400 == 0:
            batch.commit()
            batch = db.batch()

    if count % 400 != 0:
        batch.commit()

    return count


def remove_superseded_filings(db: firestore.Client, disc_urls: list[str]) -> int:
    """Delete the filings still credited to earlier versions of amended
    disclosures. Run after the current versions are written: a filing both
    versions report already names the current version and is kept."""
    removed = 0
    for url in disc_urls:
        query = db.collection(FILINGS_COLLECTION).where(
            filter=firestore.FieldFilter("disclosureUrl", "==", url)
        )
        refs = [doc.reference for doc in query.stream()]
        batch = db.batch()
        for i, ref in enumerate(refs, 1):
            batch.delete(ref)
            if i % 400 == 0:
                batch.commit()
                batch = db.batch()
        if len(refs) % 400:
            batch.commit()
        removed += len(refs)
    return removed
