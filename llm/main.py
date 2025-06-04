from flask import Flask, jsonify, abort, request
from llm_functions import get_summary_api_function, get_tags_api_function
import json
from firebase_admin import initialize_app
from firebase_functions import https_fn, options

initialize_app()
app = Flask(__name__)


def is_intersection(keys, required_keys):
    return (keys & required_keys) == required_keys


@app.route("/summary", methods=["POST"])
def summary():
    body = json.loads(request.data)
    # We require bill_id, bill_title, bill_text to exist as keys in the POST
    if not is_intersection(body.keys(), {"bill_id", "bill_title", "bill_text"}):
        abort(404, description="requires bill_id, bill_title, and bill_text")

    summary = get_summary_api_function(
        body["bill_id"], body["bill_title"], body["bill_text"]
    )

    if summary["status"] in [-1, -2]:
        abort(500, description="Unable to generate summary")

    return jsonify(summary["summary"])

@app.route("/tags", methods=["POST"])
def tags():
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

@https_fn.on_request(secrets=["OPENAI_DEV"], timeout_sec=300, memory=options.MemoryOption.GB_1)
def httpsflaskexample(req: https_fn.Request) -> https_fn.Response:
    with app.request_context(req.environ):
        return app.full_dispatch_request()
