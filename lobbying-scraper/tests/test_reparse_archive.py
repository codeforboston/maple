"""Unit tests for reparse_archive progress-tracking helpers.

These tests mock the GCS Blob object so no network access is required.
"""

from __future__ import annotations

import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from reparse_archive import _is_processed, _mark_processed


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
