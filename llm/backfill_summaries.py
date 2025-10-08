# This script fills any missing 'summary' or 'topics' fields on the data model.
# The document must have a 'Title' and 'DocumentText' field to generate them.
#
# Developer notes:
# - you'll need to set the 'OPENAI_API_KEY' environment variable
import firebase_admin
from llm_functions import get_summary_api_function, get_tags_api_function_v2
from firebase_admin import firestore
from bill_on_document_created import get_categories_from_topics, CATEGORY_BY_TOPIC

# Application Default credentials are automatically created.
app = firebase_admin.initialize_app()
db = firestore.client()


# Conceptually, we want to return a very consistent format when generated status reports.
# It would allow us to skip LLM regeneration when moving from dev to production.
def make_bill_summary(bill_id, status, summary, topics):
    return f"{bill_id},{status},{summary},{topics}"


bills_ref = db.collection("generalCourts/194/bills")
bills = bills_ref.get()
with open("./summaries-and-topics.csv", "w") as f:
    f.write("bill_id,status,summary,topics\n")
    for bill in bills:
        document = bill.to_dict()
        bill_id = document["id"]
        document_text = document.get("content", {}).get("DocumentText")
        document_title = document.get("content", {}).get("Title")
        summary = document.get("summary")

        # No document text, skip it because we can't summarize it
        if document_text is None:
            f.write(make_bill_summary(bill_id, "skipped", None, None))
            f.write("\n")
            continue

        # If the summary is already populated move on
        if summary is not None:
            f.write(make_bill_summary(bill_id, "previous_summary", None, None))
            f.write("\n")
            continue

        summary = get_summary_api_function(bill_id, document_title, document_text)
        if summary["status"] in [-1, -2]:
            f.write(make_bill_summary(bill_id, "failed_summary", None, None))
            f.write("\n")
            continue
        summary = summary["summary"]
        bill.reference.update({"summary": summary})
        f.write(make_bill_summary(bill_id, "generated_summary", summary, None))
        f.write("\n")

        # If the summary is already populated move on
        topics = document.get("topics")
        if topics is not None:
            f.write(make_bill_summary(bill_id, "previous_topics", None, None))
            f.write("\n")
            continue
        tags = get_tags_api_function_v2(bill_id, document_title, summary)
        if tags["status"] != 1:
            f.write(make_bill_summary(bill_id, "failed_topics", None, None))
            f.write("\n")
            continue
        topics_and_categories = get_categories_from_topics(
            tags["tags"], CATEGORY_BY_TOPIC
        )
        bill.reference.update({"topics": topics_and_categories})
        f.write(
            make_bill_summary(bill_id, "generated_topics", None, topics_and_categories)
        )
        exit()
