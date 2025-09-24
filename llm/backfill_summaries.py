import firebase_admin
from llm_functions import get_summary_api_function, get_tags_api_function_v2
from firebase_admin import firestore
from bill_on_document_created import get_categories_from_topics, CATEGORY_BY_TOPIC

# Application Default credentials are automatically created.
app = firebase_admin.initialize_app()
db = firestore.client()

bills_ref = db.collection("generalCourts/194/bills")
bills = bills_ref.get()
count = 0
for bill in bills:
    document = bill.to_dict()
    bill_id = document["id"]
    document_text = document.get("content", {}).get("DocumentText")
    document_title = document.get("content", {}).get("Title")
    summary = document.get("summary")

    # No document text, skip it because we can't summarize it
    if document_text is None:
        print(f"{bill_id},skipped")
        continue

    # If the summary is already populated move on
    if summary is not None:
        print(f"{bill_id},previous_summary")
        continue

    summary = get_summary_api_function(bill_id, document_title, document_text)
    if summary["status"] in [-1, -2]:
        print(f"{bill_id},failed_summary")
        continue
    summary = summary["summary"]
    print(f"summary: {summary}")
    # bill.reference.update({"summary": summary})
    print(f"{bill_id},generate_summary")

    # If the summary is already populated move on
    topics = document.get("topics")
    if topics is not None:
        print(f"{document['id']},previous_topics")
        continue
    tags = get_tags_api_function_v2(bill_id, document_title, summary)
    if tags["status"] != 1:
        print(f"{bill_id},failed_topics")
        continue
    topics_and_categories = get_categories_from_topics(tags["tags"], CATEGORY_BY_TOPIC)
    print(f"topics_and_categories: {topics_and_categories}")
    # bill.reference.update({"topics": topics_and_categories})
    print(f"{bill_id},generate_topics")
    exit()
