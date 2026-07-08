"""Regression tests for the MA SoS lobbying disclosure parser.

The portal HTML has four distinct format eras; the parser is the most likely
thing to silently break when the portal changes its markup. These tests parse
committed fixture pages (one per era, employer + individual) and assert known-
correct compensation totals, client/bill counts, era detection, and specific
bug fixes (the "Total amount" summary-row artifact; the "H73;" semicolon bill
separator; hybrid-era Panel1 compensation).

Fixtures: tests/fixtures/*.html.gz (gzipped real disclosure + summary pages).
"""

import gzip
import sys
from pathlib import Path

import pytest
from bs4 import BeautifulSoup

sys.path.insert(0, str(Path(__file__).parent.parent))

from portal import (
    _parse_amount,
    parse_disclosure_detail,
    parse_summary,
    year_to_general_court,
)

FIXTURES = Path(__file__).parent / "fixtures"


def _soup(name: str) -> BeautifulSoup:
    with gzip.open(FIXTURES / f"{name}.html.gz", "rt", encoding="utf-8") as fh:
        return BeautifulSoup(fh.read(), "html.parser")


def _comp_total(detail) -> float:
    return sum(c.amount for c in detail.compensation if c.amount)


# ── Disclosure parsing ────────────────────────────────────────────────────────

# (fixture, year, expected_comp, n_clients, n_bills, era_label)
# expected_comp is the sum of detail.compensation (per-client entries only).
# 2005-2008 era has no per-client breakdown; see test_legacy_2007_total_compensation.
DISCLOSURE_CASES = [
    ("2007e", 2007,         0.0,   0,    2, "legacy 2005-2008: entity total in legacy_total_compensation"),
    ("2011e", 2011, 641_243.00,  23,    4, "legacy 2009-2013: per-client Compensation received column"),
    ("2016e", 2016, 990_474.00,  30, 1357, "hybrid 2014-2018: Panel1 div totals"),
    ("2024e", 2024, 115_000.00,   5,   22, "modern 2019+: grdvClientPaidToEntity"),
    ("2024i", 2024, 1_095_200.0, 17,  135, "modern 2019+ individual"),
    ("2011i", 2011,  18_518.00,   1,    0, "legacy 2009-2013 individual"),
]


@pytest.mark.parametrize("fix,year,exp_comp,n_clients,n_bills,era", DISCLOSURE_CASES)
def test_compensation_total_and_counts(fix, year, exp_comp, n_clients, n_bills, era):
    detail = parse_disclosure_detail(_soup(f"{fix}_disc"), year)
    assert _comp_total(detail) == pytest.approx(exp_comp, abs=1.0), f"{fix} ({era}) comp total"
    assert len(detail.compensation) == n_clients, f"{fix} ({era}) client count"
    assert len(detail.bills) == n_bills, f"{fix} ({era}) bill count"


@pytest.mark.parametrize("fix,year,_c,_n,_b,_e", DISCLOSURE_CASES)
def test_no_total_amount_artifact(fix, year, _c, _n, _b, _e):
    """The legacy individual summary row (client_name == 'Total amount') must
    never be captured as a real client — that bug inflated 2010-2013 comp rows."""
    detail = parse_disclosure_detail(_soup(f"{fix}_disc"), year)
    bad = [
        c for c in detail.compensation
        if c.client_name in ("Total amount", "Total", "")
    ]
    assert not bad, f"{fix} produced summary-row artifacts: {bad}"


def test_legacy_2007_total_compensation():
    """2005-2008 has no per-client comp column; the entity salary total is stored
    in legacy_total_compensation with an empty per-client compensation list."""
    detail = parse_disclosure_detail(_soup("2007e_disc"), 2007)
    assert detail.compensation == []
    assert detail.legacy_total_compensation == pytest.approx(112_500.00, abs=1.0)


def test_non_legacy_has_no_legacy_total_compensation():
    """Only 2005-2008 filings set legacy_total_compensation; all other eras leave it None."""
    for fix, year in [("2011e", 2011), ("2016e", 2016), ("2024e", 2024)]:
        detail = parse_disclosure_detail(_soup(f"{fix}_disc"), year)
        assert detail.legacy_total_compensation is None, f"{fix} should not set legacy_total_compensation"


def test_legacy_2011_is_per_client_not_placeholder():
    """2009-2013 has a per-client 'Compensation received' column, so comp is
    stored under real client names — never the _total_salary_ placeholder."""
    detail = parse_disclosure_detail(_soup("2011e_disc"), 2011)
    names = [c.client_name for c in detail.compensation]
    assert "_total_salary_" not in names
    assert len(names) == len(set(names)), "per-client compensation should be deduplicated"


def test_hybrid_2016_has_nonzero_compensation():
    """2014-2018 compensation comes from Panel1 divs; was silently $0 before fix."""
    detail = parse_disclosure_detail(_soup("2016e_disc"), 2016)
    assert _comp_total(detail) == pytest.approx(990_474.00, abs=1.0)
    assert len(detail.compensation) == 30


def test_semicolon_bill_separator_parsed():
    """Legacy bill tokens may use 'H73; Title' (semicolon separator) instead of
    a space; the bill number must still be parsed correctly."""
    detail = parse_disclosure_detail(_soup("2011e_disc"), 2011)
    house_numbers = {b.raw_bill_number for b in detail.bills if b.chamber == "House Bill"}
    assert "73" in house_numbers, "H73 (semicolon-separated) should be parsed"


def test_modern_individual_per_client_comp():
    """Modern individual registrants report per-client compensation in
    grdvClientPaidToEntity — verify it is captured."""
    detail = parse_disclosure_detail(_soup("2024i_disc"), 2024)
    assert _comp_total(detail) > 0
    assert all(
        c.client_name not in ("Total amount", "") for c in detail.compensation
    )


# ── Summary page parsing ──────────────────────────────────────────────────────

# (fixture, entity_name, year, reg_type, n_disc_urls)
SUMMARY_CASES = [
    ("2007e_summ", "Ventry Associates, LLP",   2007, "Employer",  2),
    ("2011e_summ", "ML Strategies, LLC",        2011, "Employer",  7),
    ("2024e_summ", "21c, LLC",                  2024, "Employer",  2),
    ("2024i_summ", "Anthony Arthur Abdelahad",  2024, "Lobbyist",  2),
    ("2011i_summ", "Aaron Judd Agulnek",        2011, "Lobbyist",  4),
]


@pytest.mark.parametrize("fix,name,year,reg_type,n_urls", SUMMARY_CASES)
def test_summary_metadata(fix, name, year, reg_type, n_urls):
    meta = parse_summary(_soup(fix))
    assert meta.entity_name == name
    assert meta.year == year
    assert meta.reg_type == reg_type
    assert len(meta.disclosure_urls) == n_urls
    assert all("CompleteDisclosure" in u for u in meta.disclosure_urls)


# ── Helper functions ──────────────────────────────────────────────────────────

def test_parse_amount():
    assert _parse_amount("$1,234.56") == 1234.56
    assert _parse_amount("$0.00") == 0.0
    assert _parse_amount("") is None
    assert _parse_amount("N/A") is None


def test_year_to_general_court():
    assert year_to_general_court(2003) == 183
    assert year_to_general_court(2004) == 183
    assert year_to_general_court(2005) == 184
    assert year_to_general_court(2023) == 193
    assert year_to_general_court(2025) == 194


# ── Bill ID construction ──────────────────────────────────────────────────────

def test_bill_ids_in_modern_disclosure():
    """Verify bill_id is correctly constructed for each chamber prefix."""
    detail = parse_disclosure_detail(_soup("2024e_disc"), 2024)
    house = [b for b in detail.bills if b.chamber == "House Bill"]
    senate = [b for b in detail.bills if b.chamber == "Senate Bill"]
    if house:
        assert all(b.bill_id and b.bill_id.startswith("H") for b in house)
    if senate:
        assert all(b.bill_id and b.bill_id.startswith("S") for b in senate)


def test_executive_rows_have_null_bill_id():
    """Executive chamber rows must produce null billId so no accidental bill join occurs."""
    detail = parse_disclosure_detail(_soup("2024i_disc"), 2024)
    executive = [b for b in detail.bills if b.chamber == "Executive"]
    if executive:
        assert all(b.bill_id is None for b in executive)
