"""Tests for merging the registration pages' superseded-version maps."""

import os

# migrate_lobbying_data turns on ARCHIVE_RAW when imported; keep that from
# leaking into other tests.
_archive_raw = os.environ.get("ARCHIVE_RAW")
from migrate_lobbying_data import resolve_superseded  # noqa: E402

if _archive_raw is None:
    os.environ.pop("ARCHIVE_RAW", None)
else:
    os.environ["ARCHIVE_RAW"] = _archive_raw


def test_points_each_version_at_its_final_one_across_pages():
    """An older page says A -> B, a newer one B -> C: A's current is C."""
    assert resolve_superseded([{"A": "B"}, {"B": "C"}]) == {"A": "C", "B": "C"}


def test_keeps_direct_entries():
    assert resolve_superseded([{"A": "B", "X": "Y"}, {"A": "B"}]) == {"A": "B", "X": "Y"}


def test_a_cycle_stops_on_a_superseded_version():
    resolved = resolve_superseded([{"A": "B"}, {"B": "A"}])
    # Each points at a version that is itself superseded, so the write phase
    # reports them for a person to look at instead of looping.
    assert set(resolved) == {"A", "B"}
    assert all(cur in resolved for cur in resolved.values())
