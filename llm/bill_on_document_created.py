from firebase_functions.firestore_fn import (
    on_document_created,
    Event,
    DocumentSnapshot,
)
from llm_functions import get_summary_api_function


@on_document_created(document="generalCourts/{session_id}/bills/{bill_id}")
def add_summary_on_document_created(event: Event[DocumentSnapshot]) -> None:
    bill_id = event.params["bill_id"]
    inserted_data = event.data
    inserted_content = inserted_data.to_dict()

    # If the summary was pre-propulated for some reason, we don't want to run the LLM
    if inserted_content.get("summary"):
        print(f"bill with id `{bill_id}` has summary")
        return

    if inserted_content.get("contents").get("DocumentText") and inserted_content.get(
        "contents"
    ).get("Title"):
        document_text = inserted_content["contents"]["DocumentText"]
        document_title = inserted_content["contents"]["Title"]

        summary = get_summary_api_function(bill_id, document_title, document_text)

        if summary["status"] in [-1, -2]:
            print(
                f"failed to generate summary for bill with id `{bill_id}`, got {summary['status']}"
            )
            return

        inserted_data.reference.update({"summary": summary["summary"]})
    else:
        print(f"unable to find document text or title for bill with id `{bill_id}`")

    return
