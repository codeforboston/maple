"""Tests for the filing-periods phase's URL → reporting period mapping."""

import os

# migrate_lobbying_data turns on ARCHIVE_RAW when imported; keep that from
# leaking into other tests.
_archive_raw = os.environ.get("ARCHIVE_RAW")
from migrate_lobbying_data import periods_by_disclosure_url  # noqa: E402

if _archive_raw is None:
    os.environ.pop("ARCHIVE_RAW", None)
else:
    os.environ["ARCHIVE_RAW"] = _archive_raw


def test_maps_each_disclosure_to_its_registrant_period():
    periods, conflicts = periods_by_disclosure_url([
        {"disclosureUrls": ["a", "b"], "periodStart": "2025-01-01", "periodEnd": "2025-06-30"},
        {"disclosureUrls": ["c"], "periodStart": "2025-07-01", "periodEnd": "2025-12-31"},
    ])
    assert periods == {
        "a": ("2025-01-01", "2025-06-30"),
        "b": ("2025-01-01", "2025-06-30"),
        "c": ("2025-07-01", "2025-12-31"),
    }
    assert conflicts == set()


def test_skips_registrants_without_a_period():
    periods, _ = periods_by_disclosure_url([
        {"disclosureUrls": ["a"], "periodStart": None, "periodEnd": None},
        {"disclosureUrls": ["b"]},
    ])
    assert periods == {}


def test_leaves_out_disclosures_with_conflicting_periods():
    periods, conflicts = periods_by_disclosure_url([
        {"disclosureUrls": ["a", "b"], "periodStart": "2025-01-01", "periodEnd": "2025-06-30"},
        {"disclosureUrls": ["a"], "periodStart": "2025-07-01", "periodEnd": "2025-12-31"},
    ])
    assert periods == {"b": ("2025-01-01", "2025-06-30")}
    assert conflicts == {"a"}
