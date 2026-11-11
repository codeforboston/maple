"""GCS raw-HTML archive for the MA SoS lobbying scraper.

Cold storage for every fetched Summary/CompleteDisclosure page, saved as
gs://{bucket}/raw_html/{sha1(url)}.html with the original URL stored as
object metadata. This enables offline reparsing when parser logic changes,
and an archive-aware backfill (see scrape.py's use_archive flag) that skips
live requests entirely for pages already cached — without re-scraping the
portal (which is rate-limited and Imperva-protected).

Enabled by setting ARCHIVE_RAW=1 in the environment. When disabled (default),
save_page() is a no-op and load_page() always returns None, so local runs and
tests work without GCS credentials.

The bucket is named {GOOGLE_CLOUD_PROJECT}-lobbying-archive.

ARCHIVE_DIR=<path> keeps the archive in a local folder instead, with the same
layout ({path}/raw_html/{sha1(url)}.html, plus a .url file naming the page),
for local runs that shouldn't touch GCS. It takes precedence over GCS, and
works without ARCHIVE_RAW.
"""

from __future__ import annotations

import hashlib
import os
import threading
from pathlib import Path

_ENABLED = os.environ.get("ARCHIVE_RAW", "").lower() in ("1", "true", "yes")
_LOCAL_DIR = os.environ.get("ARCHIVE_DIR") or None
_bucket_name: str | None = None
_client = None  # google.cloud.storage.Client, lazily initialized


def _gcs():
    global _client
    if _client is None:
        from google.cloud import storage  # noqa: PLC0415
        _client = storage.Client()
    return _client


def _get_bucket_name() -> str:
    global _bucket_name
    if _bucket_name is None:
        project = os.environ.get("GOOGLE_CLOUD_PROJECT") or _gcs().project
        _bucket_name = f"{project}-lobbying-archive"
    return _bucket_name


def blob_name(url: str) -> str:
    """Return the GCS object name for a given URL."""
    return "raw_html/" + hashlib.sha1(url.encode()).hexdigest() + ".html"


def _local_path(url: str) -> Path:
    return Path(_LOCAL_DIR) / blob_name(url)


def save_page(url: str, html: str) -> None:
    """Write raw HTML to the archive. No-op unless ARCHIVE_DIR or ARCHIVE_RAW is set."""
    if _LOCAL_DIR:
        try:
            path = _local_path(url)
            path.parent.mkdir(parents=True, exist_ok=True)
            # Write then rename, so concurrent workers never see a partial page.
            tmp = path.with_suffix(f".{os.getpid()}.{threading.get_ident()}.tmp")
            tmp.write_text(html, encoding="utf-8")
            os.replace(tmp, path)
            path.with_suffix(".url").write_text(url, encoding="utf-8")
        except Exception as exc:
            print(f"  [archive] WARNING: failed to save {url[:80]!r}: {exc}")
        return
    if not _ENABLED:
        return
    try:
        bucket = _gcs().bucket(_get_bucket_name())
        blob = bucket.blob(blob_name(url))
        blob.metadata = {"source-url": url}
        blob.upload_from_string(
            html.encode("utf-8"),
            content_type="text/html; charset=utf-8",
        )
    except Exception as exc:
        # Archive failures must never interrupt the live scrape path.
        print(f"  [archive] WARNING: failed to save {url[:80]!r}: {exc}")


def load_page(url: str) -> str | None:
    """Return cached HTML for url, or None if not archived (or ARCHIVE_RAW unset).

    Never raises — a read failure just means "not cached", so callers fall
    back to a live fetch instead of crashing, matching save_page's philosophy
    that archive problems must never interrupt the actual scrape.
    """
    if _LOCAL_DIR:
        try:
            path = _local_path(url)
            return path.read_text(encoding="utf-8") if path.exists() else None
        except Exception as exc:
            print(f"  [archive] WARNING: failed to load {url[:80]!r}: {exc}")
            return None
    if not _ENABLED:
        return None
    try:
        blob = _gcs().bucket(_get_bucket_name()).blob(blob_name(url))
        if not blob.exists():
            return None
        return blob.download_as_text(encoding="utf-8")
    except Exception as exc:
        print(f"  [archive] WARNING: failed to load {url[:80]!r}: {exc}")
        return None
