from flask import Flask, jsonify, abort
from llm_functions import get_summaries_and_tags_api_function

app = Flask(__name__)

@app.route('/summary', methods=['POST'])
def summary():
    body = json.loads(request.data)
    # We require bill_id, bill_title, bill_text to exist as keys in the POST
    # Note: & is essentially set intersection
    if not (body.keys() & {"bill_id", "bill_title", "bill_text"}):
        abort(404, description="requires bill_id, bill_title, and bill_text")

    summary = get_summaries_and_tags_api_function(
        body["bill_id"],
        body["bill_title"],
        body["bill_text"]
    )

    if summary["status"] in [-1, -2]:
        abort(404, description="unable to generate summary or tags")
    
    return jsonify(summary)
