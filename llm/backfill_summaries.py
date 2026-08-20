"""Legacy import-time entrypoint for backfilling bill summaries and topics.

Importing this module immediately runs the backfill for General Court 194 and
writes `./summaries-and-topics.csv`, matching the original script behavior.
Use `backfill_summaries_runner.py` for an import-safe CLI and test target.
"""

import firebase_admin
from backfill_summaries_runner import (
    CSV_SUMMARY_OUTPUT,
    backfill_summaries,
    write_rows,
)
from firebase_admin import firestore

firebase_admin.initialize_app()
db = firestore.client()
rows = backfill_summaries(db, court=194)
write_rows(CSV_SUMMARY_OUTPUT, rows)
