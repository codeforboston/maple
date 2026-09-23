"""Unit tests for the GCS raw-HTML archive read/write helpers.

Mocks the GCS client so no network access or credentials are needed.
"""

from __future__ import annotations

import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

sys.path.insert(0, str(Path(__file__).parent.parent))

import archive


class TestLoadPageDisabled:
    def test_returns_none_when_archive_raw_unset(self):
        with patch("archive._ENABLED", False):
            assert archive.load_page("https://example.com/x") is None

    def test_does_not_touch_gcs_when_disabled(self):
        with patch("archive._ENABLED", False), patch("archive._gcs") as mock_gcs:
            archive.load_page("https://example.com/x")
            mock_gcs.assert_not_called()


class TestLoadPageEnabled:
    def _mock_gcs(self, blob):
        bucket = MagicMock()
        bucket.blob.return_value = blob
        client = MagicMock()
        client.bucket.return_value = bucket
        return client

    def test_returns_none_when_blob_missing(self):
        blob = MagicMock()
        blob.exists.return_value = False
        with patch("archive._ENABLED", True), patch(
            "archive._gcs", return_value=self._mock_gcs(blob)
        ), patch("archive._get_bucket_name", return_value="test-bucket"):
            assert archive.load_page("https://example.com/x") is None
        blob.download_as_text.assert_not_called()

    def test_returns_cached_text_on_hit(self):
        blob = MagicMock()
        blob.exists.return_value = True
        blob.download_as_text.return_value = "<html>cached</html>"
        with patch("archive._ENABLED", True), patch(
            "archive._gcs", return_value=self._mock_gcs(blob)
        ), patch("archive._get_bucket_name", return_value="test-bucket"):
            result = archive.load_page("https://example.com/x")
        assert result == "<html>cached</html>"

    def test_returns_none_not_raises_on_gcs_error(self):
        with patch("archive._ENABLED", True), patch(
            "archive._gcs", side_effect=RuntimeError("boom")
        ), patch("archive._get_bucket_name", return_value="test-bucket"):
            # Must degrade to "not cached", never propagate the error —
            # matches save_page's "archive failures never interrupt the scrape".
            assert archive.load_page("https://example.com/x") is None
