"""Unit tests for reparse_archive progress-tracking helpers.

These tests mock the GCS Blob object so no network access is required.
"""

from __future__ import annotations

import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from portal import DisclosureDetail, DisclosureMeta
from reparse_archive import _is_processed, _mark_processed, run


def _make_blob(metadata: dict | None = None) -> MagicMock:
    blob = MagicMock()
    blob.metadata = metadata
    return blob


class TestIsProcessed:
    def test_none_metadata(self):
        assert not _is_processed(_make_blob(None))

    def test_empty_metadata(self):
        assert not _is_processed(_make_blob({}))

    def test_unrelated_key(self):
        assert not _is_processed(_make_blob({"source-url": "https://example.com"}))

    def test_wrong_value(self):
        assert not _is_processed(_make_blob({"reparse-processed": "false"}))

    def test_processed(self):
        assert _is_processed(_make_blob({"reparse-processed": "true"}))

    def test_processed_with_other_keys(self):
        assert _is_processed(
            _make_blob({"source-url": "https://example.com", "reparse-processed": "true"})
        )


class TestMarkProcessed:
    def test_sets_flag_on_none_metadata(self):
        blob = _make_blob(None)
        _mark_processed(blob)
        assert blob.metadata["reparse-processed"] == "true"
        blob.patch.assert_called_once()

    def test_sets_flag_on_empty_metadata(self):
        blob = _make_blob({})
        _mark_processed(blob)
        assert blob.metadata["reparse-processed"] == "true"
        blob.patch.assert_called_once()

    def test_preserves_existing_keys(self):
        blob = _make_blob({"source-url": "https://example.com"})
        _mark_processed(blob)
        assert blob.metadata["source-url"] == "https://example.com"
        assert blob.metadata["reparse-processed"] == "true"
        blob.patch.assert_called_once()

    def test_idempotent(self):
        blob = _make_blob({"reparse-processed": "true"})
        _mark_processed(blob)
        assert blob.metadata["reparse-processed"] == "true"
        blob.patch.assert_called_once()

    def test_original_metadata_not_mutated(self):
        original = {"source-url": "https://example.com"}
        blob = _make_blob(original)
        _mark_processed(blob)
        # The dict spread creates a new dict, so original is unchanged
        assert "reparse-processed" not in original


class TestRunRecoversRegistrantsNotJustFilings:
    """run() must recover registrant (compensation/client roster) data, not
    just re-confirm bill-level filings — this is the whole point of using the
    archive to recover the pre-fix registrant/period collision data loss."""

    def _run_with_one_qualifying_blob(self, **overrides):
        blob = _make_blob({"source-url": "https://sec.state.ma.us/.../CompleteDisclosure.aspx?x=1"})
        blob.name = "raw_html/abc123.html"
        blob.download_as_text.return_value = "<html></html>"

        bucket = MagicMock()
        bucket.list_blobs.return_value = [blob]
        gcs_client = MagicMock()
        gcs_client.bucket.return_value = bucket

        fake_meta = overrides.get(
            "meta",
            DisclosureMeta(entity_name="Acme", year=2024, reg_type="Employer"),
        )
        fake_detail = overrides.get("detail", DisclosureDetail(compensation=[], bills=[]))

        with patch("reparse_archive.storage.Client", return_value=gcs_client), patch(
            "reparse_archive.archive._get_bucket_name", return_value="test-bucket"
        ), patch("reparse_archive.firestore.Client", return_value=MagicMock()), patch(
            "reparse_archive._meta_for_disc_url", return_value=fake_meta
        ), patch(
            "reparse_archive.parse_disclosure_detail", return_value=fake_detail
        ), patch(
            "reparse_archive.write_registrant"
        ) as mock_write_registrant, patch(
            "reparse_archive.write_filings"
        ) as mock_write_filings, patch(
            "reparse_archive._mark_processed"
        ) as mock_mark_processed:
            run(limit=None, dry_run=False)

        return mock_write_registrant, mock_write_filings, mock_mark_processed

    def test_qualifying_blob_triggers_both_writes(self):
        mock_write_registrant, mock_write_filings, mock_mark_processed = (
            self._run_with_one_qualifying_blob()
        )
        mock_write_registrant.assert_called_once()
        mock_write_filings.assert_called_once()
        mock_mark_processed.assert_called_once()

    def test_dry_run_calls_neither_write(self):
        blob = _make_blob({"source-url": "https://sec.state.ma.us/.../CompleteDisclosure.aspx?x=1"})
        blob.name = "raw_html/abc123.html"
        blob.download_as_text.return_value = "<html></html>"
        bucket = MagicMock()
        bucket.list_blobs.return_value = [blob]
        gcs_client = MagicMock()
        gcs_client.bucket.return_value = bucket
        fake_meta = DisclosureMeta(entity_name="Acme", year=2024, reg_type="Employer")

        with patch("reparse_archive.storage.Client", return_value=gcs_client), patch(
            "reparse_archive.archive._get_bucket_name", return_value="test-bucket"
        ), patch("reparse_archive.firestore.Client", return_value=MagicMock()), patch(
            "reparse_archive._meta_for_disc_url", return_value=fake_meta
        ), patch(
            "reparse_archive.parse_disclosure_detail",
            return_value=DisclosureDetail(compensation=[], bills=[]),
        ), patch(
            "reparse_archive.write_registrant"
        ) as mock_write_registrant, patch(
            "reparse_archive.write_filings"
        ) as mock_write_filings:
            run(limit=None, dry_run=True)

        mock_write_registrant.assert_not_called()
        mock_write_filings.assert_not_called()
