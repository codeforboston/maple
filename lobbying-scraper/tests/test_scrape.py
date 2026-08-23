"""Unit tests for the weekly-mode cursor logic in scrape.py.

Uses a tiny in-memory fake standing in for firestore.Client — real enough to
exercise document/subcollection reads and writes statefully across calls
(unlike a plain MagicMock, which can't easily simulate "write now, read back
later"), without needing a live database or emulator.
"""

from __future__ import annotations

import sys
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).parent.parent))

from portal import DisclosureDetail, DisclosureMeta
import scrape


# ── Fake Firestore ────────────────────────────────────────────────────────────


class _FakeSnapshot:
    def __init__(self, data):
        self._data = data

    @property
    def exists(self):
        return self._data is not None

    def to_dict(self):
        return self._data


class _FakeDocRef:
    def __init__(self, store, path):
        self._store = store
        self._path = path

    def get(self):
        return _FakeSnapshot(self._store.get(self._path))

    def set(self, data, merge=False):
        if merge and self._path in self._store:
            self._store[self._path] = {**self._store[self._path], **data}
        else:
            self._store[self._path] = dict(data)

    def collection(self, name):
        return _FakeCollectionRef(self._store, f"{self._path}/{name}")


class _FakeCollectionRef:
    def __init__(self, store, path):
        self._store = store
        self._path = path

    def document(self, doc_id):
        return _FakeDocRef(self._store, f"{self._path}/{doc_id}")


class FakeFirestore:
    """Minimal stand-in for firestore.Client: document()/collection() only."""

    def __init__(self):
        self.store: dict[str, dict] = {}

    def document(self, path):
        return _FakeDocRef(self.store, path)

    def collection(self, name):
        return _FakeCollectionRef(self.store, name)


# ── Helpers ───────────────────────────────────────────────────────────────────


def _meta(summary_url: str, disc_urls: list[str]) -> DisclosureMeta:
    return DisclosureMeta(
        entity_name=f"Entity for {summary_url}",
        year=2024,
        reg_type="Employer",
        disclosure_urls=disc_urls,
    )


# ── run_weekly: subcollection cursor sanity checks ───────────────────────────


def test_weekly_skips_already_processed_disclosure():
    db = FakeFirestore()
    summary_url = "https://x/summary/a"
    disc_url = "https://x/disc/1"
    meta_by_url = {summary_url: _meta(summary_url, [disc_url])}

    def run(year):
        with patch("scrape.make_session", return_value=None), patch(
            "scrape.fetch_summary_links",
            side_effect=lambda session, y: [summary_url],
        ), patch(
            "scrape.fetch_disclosure_meta",
            side_effect=lambda session, url: meta_by_url[url],
        ), patch(
            "scrape.fetch_disclosure_detail", return_value=DisclosureDetail()
        ), patch(
            "scrape.write_registrant", return_value=None
        ), patch(
            "scrape.write_filings", return_value=0
        ):
            return scrape.run_weekly(db, years=[year])

    # Use a prior (non-current) year so caching also gets exercised below.
    n1 = run(2020)
    n2 = run(2020)

    assert n1 == 1
    assert n2 == 0


def test_weekly_caches_prior_year_but_not_current_year():
    db = FakeFirestore()
    current_year = scrape.datetime.now(tz=scrape.timezone.utc).year
    prior_year = current_year - 1
    summary_url = "https://x/summary/a"

    with patch("scrape.make_session", return_value=None), patch(
        "scrape.fetch_summary_links",
        side_effect=lambda session, y: [summary_url],
    ), patch(
        "scrape.fetch_disclosure_meta",
        side_effect=lambda session, url: _meta(url, []),
    ) as fetch_meta:
        # Prior year twice: second call should hit the cache, not refetch.
        scrape.run_weekly(db, years=[prior_year])
        scrape.run_weekly(db, years=[prior_year])
        assert fetch_meta.call_count == 1

        # Current year twice: must always refetch live.
        fetch_meta.reset_mock()
        scrape.run_weekly(db, years=[current_year])
        scrape.run_weekly(db, years=[current_year])
        assert fetch_meta.call_count == 2


def test_weekly_cursor_doc_never_exceeds_a_few_small_fields():
    """Regression guard for the original 1MB-doc bug: the parent scraper doc
    itself must stay tiny — all real state lives in subcollection docs."""
    db = FakeFirestore()
    summary_url = "https://x/summary/a"
    disc_url = "https://x/disc/1"
    meta_by_url = {summary_url: _meta(summary_url, [disc_url])}

    with patch("scrape.make_session", return_value=None), patch(
        "scrape.fetch_summary_links",
        side_effect=lambda session, y: [summary_url],
    ), patch(
        "scrape.fetch_disclosure_meta",
        side_effect=lambda session, url: meta_by_url[url],
    ), patch(
        "scrape.fetch_disclosure_detail", return_value=DisclosureDetail()
    ), patch(
        "scrape.write_registrant", return_value=None
    ), patch(
        "scrape.write_filings", return_value=0
    ):
        scrape.run_weekly(db, years=[2020])

    parent = db.store.get(scrape.SCRAPER_DOC)
    assert parent is None or "processedDiscUrls" not in parent
    assert parent is None or "summaryDiscCache" not in parent

    # The actual state must be in per-URL subcollection docs.
    subcollection_paths = [
        p for p in db.store if p.startswith(scrape.SCRAPER_DOC + "/")
    ]
    assert len(subcollection_paths) >= 2  # one processedUrls doc, one summaryCache doc


def test_weekly_dry_run_never_touches_firestore():
    db = FakeFirestore()
    summary_url = "https://x/summary/a"
    disc_url = "https://x/disc/1"
    meta_by_url = {summary_url: _meta(summary_url, [disc_url])}

    with patch("scrape.make_session", return_value=None), patch(
        "scrape.fetch_summary_links",
        side_effect=lambda session, y: [summary_url],
    ), patch(
        "scrape.fetch_disclosure_meta",
        side_effect=lambda session, url: meta_by_url[url],
    ), patch(
        "scrape.fetch_disclosure_detail", return_value=DisclosureDetail()
    ):
        n = scrape.run_weekly(None, years=[2024], dry_run=True)

    assert n == 1
    assert db.store == {}
