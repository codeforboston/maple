"""Unit tests for portal.py's archive-aware fetch behavior (_get's use_archive flag).

Distinct from test_portal_parser.py, which covers the pure HTML parsers —
these cover the fetch wrapper's live-vs-cached decision, with a mocked
requests.Session so no network access is needed.
"""

from __future__ import annotations

import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

sys.path.insert(0, str(Path(__file__).parent.parent))

from portal import _get


def _fake_response(text: str = "<html></html>", status_code: int = 200) -> MagicMock:
    resp = MagicMock()
    resp.status_code = status_code
    resp.text = text
    resp.raise_for_status.return_value = None
    return resp


class TestArchiveAwareGet:
    def test_use_archive_true_and_cached_skips_live_request(self):
        """A cache hit must skip session.get entirely — proves both the live
        request and its rate-limit sleep are avoided, the whole point of
        making the backfill archive-aware."""
        session = MagicMock()
        with patch("portal.archive.load_page", return_value="<html>cached</html>"):
            _get(session, "https://example.com/CompleteDisclosure.aspx?x=1", use_archive=True)
        session.get.assert_not_called()

    def test_use_archive_true_but_not_cached_falls_through_to_live(self):
        """A cache miss must still fetch live, not fail or return empty."""
        session = MagicMock()
        session.get.return_value = _fake_response()
        with patch("portal.archive.load_page", return_value=None), patch(
            "portal.archive.save_page"
        ):
            _get(session, "https://example.com/CompleteDisclosure.aspx?x=1", use_archive=True)
        session.get.assert_called_once()

    def test_use_archive_false_never_consults_archive(self):
        """Default (use_archive=False, what run_weekly() always uses) must not
        even check the archive — proves weekly's current-year-freshness
        guarantee is untouched by this feature, regardless of what's cached."""
        session = MagicMock()
        session.get.return_value = _fake_response()
        with patch("portal.archive.load_page") as mock_load, patch(
            "portal.archive.save_page"
        ):
            _get(session, "https://example.com/CompleteDisclosure.aspx?x=1")
        mock_load.assert_not_called()
        session.get.assert_called_once()
