"""This script fills any missing 'summary' or 'topics' fields on the data model.

The document must have a 'Title' and 'DocumentText' field to generate them. The
script queries only the general court 194 bills, modifies the firebase database
in-place, and generates a CSV with a description of what happened. The header for
the CSV is `bill_id,status,summary,topics`. The possible statuses are,

- `skipped` - the bill doesn't have either a title or text, skip it
- `previous_summary` - the bill previously had a summary, skip it
- `failed_summary` - something went wrong when trying to summarize, skip it
- `previous_topics` - the bill previously had topics, skip it
- `failed_topics` - something went wrong when trying to generate topics, skip it
- `generated_summary` - both the summary and topics were generated successfully

Developer notes:
- you'll need to set the 'OPENAI_API_KEY' environment variable
"""

import firebase_admin
from llm_functions import get_summary_api_function, get_tags_api_function_v2
from firebase_admin import firestore
from bill_on_document_created import get_categories_from_topics, CATEGORY_BY_TOPIC
import csv
from normalize_summaries import normalize_summary

# Module constants
FIREBASE_COLLECTION_PATH = "generalCourts/194/bills"
CSV_SUMMARY_OUTPUT = "./summaries-and-topics.csv"

# Application Default credentials are automatically created.
app = firebase_admin.initialize_app()
db = firestore.client()


def make_bill_summary(bill_id, status, summary, topics):
    """Generate a row for csv.writerow

    The goal with this function is to not forget all the arguments to subsequent
    csv.writerow calls.
    """
    return [f"{bill_id}", f"{status}", f"{summary}", f"{topics}"]


bills_ref = db.collection(FIREBASE_COLLECTION_PATH)
bills = bills_ref.get()
with open(CSV_SUMMARY_OUTPUT, "w") as csvfile:
    csv_writer = csv.writer(csvfile)
    csv_writer.writerow(["bill_id", "status", "summary", "topics"])
    for bill in bills:
        document = bill.to_dict()
        bill_id = document["id"]
        document_text = document.get("content", {}).get("DocumentText")
        document_title = document.get("content", {}).get("Title")
        summary = document.get("summary")

        # No document text or title, skip it because we can't summarize it
        if document_text is None or document_title is None:
            csv_writer.writerow(make_bill_summary(bill_id, "skipped", None, None))
            continue

        # If the summary is already populated move on
        if summary is not None:
            csv_writer.writerow(
                make_bill_summary(bill_id, "previous_summary", None, None)
            )
            continue

        summary = get_summary_api_function(bill_id, document_title, document_text)
        if summary["status"] in [-1, -2]:
            csv_writer.writerow(
                make_bill_summary(bill_id, "failed_summary", None, None)
            )
            continue
        # Note: `normalize_summary` does some post-processing to clean up the summaries
        # As of 2025-10-21 this was necessary due to the LLM prompt
        summary = normalize_summary(summary["summary"])
        bill.reference.update({"summary": summary})

        # If the topics are already populated, just make a note of it
        topics = document.get("topics")
        if topics is not None:
            csv_writer.writerow(
                make_bill_summary(bill_id, "previous_topics", None, None)
            )

        tags = get_tags_api_function_v2(bill_id, document_title, summary)
        # If the tags fail, make a note and at least write the summary for debugging
        if tags["status"] != 1:
            csv_writer.writerow(make_bill_summary(bill_id, "failed_topics", None, None))
            csv_writer.writerow(
                make_bill_summary(bill_id, "generated_summary", summary, None)
            )
            continue
        topics_and_categories = get_categories_from_topics(
            tags["tags"], CATEGORY_BY_TOPIC
        )
        bill.reference.update({"topics": topics_and_categories})
        csv_writer.writerow(
            make_bill_summary(
                bill_id, "generated_summary_and_topics", summary, topics_and_categories
            )
        )
