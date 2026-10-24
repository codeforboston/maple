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

import pytest

from portal import PortalBlocked, _get, _post, is_block_page


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


# Incapsula's block page, served with status 200 in place of the real page.
BLOCK = ('<html><head><META NAME="robots" CONTENT="noindex,nofollow">'
         '<script src="/_Incapsula_Resource?SWJIYLWA=5074a744e2e3d891814e9a2dace20bd4"></script>'
         '</head><body>Request unsuccessful. Incapsula incident ID: 1234</body></html>')
URL = "https://example.com/CompleteDisclosure.aspx?x=1"


class TestIncapsulaBlocks:
    def test_block_page_is_retried_then_raises_and_is_never_archived(self):
        session = MagicMock()
        session.get.return_value = _fake_response(BLOCK)
        with patch("portal.time.sleep"), patch("portal.archive.save_page") as save:
            with pytest.raises(PortalBlocked):
                _get(session, URL)
        assert session.get.call_count > 1
        save.assert_not_called()

    def test_block_then_real_page_returns_and_archives_the_real_page(self):
        session = MagicMock()
        session.get.side_effect = [_fake_response(BLOCK), _fake_response("<html>real</html>")]
        with patch("portal.time.sleep"), patch("portal.archive.save_page") as save:
            soup = _get(session, URL)
        assert "real" in soup.text
        save.assert_called_once_with(URL, "<html>real</html>")

    def test_archived_block_page_counts_as_missing(self):
        session = MagicMock()
        session.get.return_value = _fake_response("<html>real</html>")
        with patch("portal.archive.load_page", return_value=BLOCK), patch("portal.archive.save_page"):
            soup = _get(session, URL, use_archive=True)
        session.get.assert_called_once()
        assert "real" in soup.text

    def test_blocked_search_post_is_retried(self):
        session = MagicMock()
        session.post.side_effect = [_fake_response(BLOCK), _fake_response("<html>results</html>")]
        with patch("portal.time.sleep"):
            soup = _post(session, "https://example.com/search", {})
        assert session.post.call_count == 2 and "results" in soup.text

    def test_real_pages_are_not_block_pages(self):
        assert is_block_page(BLOCK)
        assert not is_block_page("<html>" + "x" * 6000 + "Incapsula incident ID</html>")
        assert not is_block_page("<html>An Error Occurred</html>")


def test_migration_treats_a_block_page_as_an_error_page():
    from migrate_lobbying_data import _is_error_page
    assert _is_error_page(BLOCK)
