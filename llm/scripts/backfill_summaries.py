import firebase_admin
from firebase_admin import firestore

# Application Default credentials are automatically created.
app = firebase_admin.initialize_app()
db = firestore.client()

bills_ref = db.collection("generalCourts/194/bills")
bills = bills_ref.get()
count = 0
for bill in bills:
    document = bill.to_dict()
    document_text = document.get("content", {}).get("DocumentText")
    document_title = document.get("content", {}).get("Title")
    summary = document.get("summary")

    # No document text, skip it because we can't summarize it
    if document_text is None:
        print(f"{document['id']},skipped")
        continue

    # If the summary is already populated move on
    if summary is not None:
        print(f"{document['id']},previous_summary")
        continue

    # TODO: Generate the summary
    print(f"{document['id']},generate_summary")

    # If the summary is already populated move on
    topics = document.get("topics")
    if topics is not None:
        print(f"{document['id']},previous_topics")
        continue

    # TODO: Populate the topics
    print(f"{document['id']},generate_topics")
