"""Import-safe runner for backfilling missing bill summaries and topics.

The document must have a `content.Title` and `content.DocumentText` field to
generate a summary. Topics can be generated from either an existing summary or a
newly generated one.

The CSV header is `bill_id,status,summary,topics`. The possible statuses are,

- `skipped` - the bill doesn't have either a title or text, skip it
- `previous_summary` - the bill previously had a summary
- `failed_summary` - something went wrong when trying to summarize, skip it
- `previous_topics` - the bill previously had topics, skip it
- `failed_topics` - something went wrong when trying to generate topics, skip it
- `generated_summary_and_topics` - the summary and topics were generated
  successfully

Developer notes:
- you'll need to set the `OPENAI_API_KEY` environment variable
"""

import argparse
import csv
from typing import Any

import firebase_admin
from bill_on_document_created import CATEGORY_BY_TOPIC, get_categories_from_topics
from firebase_admin import firestore
from llm_functions import get_summary_api_function, get_tags_api_function_v2

CSV_SUMMARY_OUTPUT = "./summaries-and-topics.csv"


def make_bill_summary(bill_id, status, summary, topics) -> list[str]:
    """Generate a row for csv.writerow."""
    return [f"{bill_id}", f"{status}", f"{summary}", f"{topics}"]


def parse_bill_ids(raw_bill_ids: str | None) -> set[str] | None:
    if raw_bill_ids is None:
        return None

    bill_ids = {
        bill_id.strip()
        for chunk in raw_bill_ids.split(",")
        for bill_id in chunk.split()
        if bill_id.strip()
    }
    return bill_ids or None


def backfill_summaries(
    db: Any,
    court: int = 194,
    bill_ids: set[str] | None = None,
    dry_run: bool = False,
) -> list[list[str]]:
    rows = [["bill_id", "status", "summary", "topics"]]
    bills_ref = db.collection(f"generalCourts/{court}/bills")
    bills = bills_ref.get()

    for bill in bills:
        document = bill.to_dict()
        bill_id = document["id"]
        if bill_ids is not None and bill_id not in bill_ids:
            continue

        document_text = document.get("content", {}).get("DocumentText")
        document_title = document.get("content", {}).get("Title")
        summary = document.get("summary")
        topics = document.get("topics")

        if document_text is None or document_title is None:
            rows.append(make_bill_summary(bill_id, "skipped", None, None))
            continue

        if summary is None:
            summary_response = get_summary_api_function(
                bill_id, document_title, document_text
            )
            if summary_response["status"] in [-1, -2]:
                rows.append(make_bill_summary(bill_id, "failed_summary", None, None))
                continue

            summary = summary_response["summary"]
            if not dry_run:
                bill.reference.update({"summary": summary})
        else:
            rows.append(make_bill_summary(bill_id, "previous_summary", None, None))

        if topics is not None:
            rows.append(make_bill_summary(bill_id, "previous_topics", None, None))
            continue

        tags = get_tags_api_function_v2(bill_id, document_title, summary)
        if tags["status"] != 1:
            rows.append(make_bill_summary(bill_id, "failed_topics", summary, None))
            continue

        topics_and_categories = get_categories_from_topics(
            tags["tags"], CATEGORY_BY_TOPIC
        )
        if not dry_run:
            bill.reference.update({"topics": topics_and_categories})

        rows.append(
            make_bill_summary(
                bill_id,
                "generated_summary_and_topics",
                summary,
                topics_and_categories,
            )
        )

    return rows


def write_rows(output: str, rows: list[list[str]]) -> None:
    with open(output, "w", newline="") as csvfile:
        csv.writer(csvfile).writerows(rows)


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--court", type=int, default=194)
    parser.add_argument("--bill-ids")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--output", default=CSV_SUMMARY_OUTPUT)
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    args = parse_args(argv)

    firebase_admin.initialize_app()
    db = firestore.client()
    rows = backfill_summaries(
        db,
        court=args.court,
        bill_ids=parse_bill_ids(args.bill_ids),
        dry_run=args.dry_run,
    )
    write_rows(args.output, rows)


if __name__ == "__main__":
    main()
