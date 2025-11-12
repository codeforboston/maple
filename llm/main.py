from flask import Flask, jsonify, abort, request
from llm_functions import get_summary_api_function, get_tags_api_function
import json
from firebase_admin import initialize_app
from firebase_functions import https_fn, options
import os
from firebase_functions.firestore_fn import (
    on_document_created,
    Event,
    DocumentSnapshot,
)
import bill_on_document_created
from normalize_summaries import normalize_summary

initialize_app()
app = Flask(__name__)


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


@app.route("/summary", methods=["POST"])
def summary():
    set_openai_api_key()
    body = json.loads(request.data)
    # We require bill_id, bill_title, bill_text to exist as keys in the POST
    if not is_intersection(body.keys(), {"bill_id", "bill_title", "bill_text"}):
        abort(404, description="requires bill_id, bill_title, and bill_text")

    summary = get_summary_api_function(
        body["bill_id"], body["bill_title"], body["bill_text"]
    )

    if summary["status"] in [-1, -2]:
        abort(500, description="Unable to generate summary")

    return jsonify(normalize_summary(summary["summary"]))


@app.route("/tags", methods=["POST"])
def tags():
    set_openai_api_key()
    body = json.loads(request.data)
    # We require bill_id, bill_title, bill_text to exist as keys in the POST
    # Note: & is essentially set intersection
    if not is_intersection(body.keys(), {"bill_id", "bill_title", "bill_text"}):
        abort(404, description="requires bill_id, bill_title, and bill_text")

    tags = get_tags_api_function(body["bill_id"], body["bill_title"], body["bill_text"])

    if tags["status"] in [-1, -2]:
        abort(500, description="Unable to generate tags")

    return jsonify(tags["tags"])


@app.route("/ready", methods=["GET"])
def ready():
    return ""


@https_fn.on_request(
    secrets=["OPENAI_DEV", "OPENAI_PROD"],
    timeout_sec=300,
    memory=options.MemoryOption.GB_1,
)
def httpsflaskexample(req: https_fn.Request) -> https_fn.Response:
    with app.request_context(req.environ):
        return app.full_dispatch_request()


@on_document_created(
    secrets=["OPENAI_DEV", "OPENAI_PROD"],
    timeout_sec=300,
    memory=options.MemoryOption.GB_1,
    document="generalCourts/{session_id}/bills/{bill_id}",
)
def add_summary_on_document_created(event: Event[DocumentSnapshot | None]) -> None:
    set_openai_api_key()
    bill_on_document_created.run_trigger(event)
