"""
The module contains all of the Python based Firebase functions

* add_summary_on_document_created - when new bills are written to the database, this function will trigger via on_document_created
"""

from firebase_admin import initialize_app
from firebase_functions import options
import os
from firebase_functions.firestore_fn import (
    on_document_created,
    Event,
    DocumentSnapshot,
)
import bill_on_document_created

initialize_app()


def is_intersection(keys, required_keys):
    return (keys & required_keys) == required_keys


def set_openai_api_key():
    match os.environ.get("MAPLE_DEV"):
        case "prod":
            if os.environ.get("OPENAI_PROD") is not None:
                os.environ["OPENAI_API_KEY"] = os.environ["OPENAI_PROD"]
        case _:  # if "dev" or unspecified, use OPENAI_DEV
            if os.environ.get("OPENAI_DEV") is not None:
                os.environ["OPENAI_API_KEY"] = os.environ["OPENAI_DEV"]


@on_document_created(
    secrets=["OPENAI_DEV", "OPENAI_PROD"],
    timeout_sec=300,
    memory=options.MemoryOption.GB_1,
    document="generalCourts/{session_id}/bills/{bill_id}",
)
def add_summary_on_document_created(event: Event[DocumentSnapshot | None]) -> None:
    set_openai_api_key()
    bill_on_document_created.run_trigger(event)
