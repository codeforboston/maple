"""Normalize summary outputs from the LLM

The summary prompt has some formatting prose that we don't want to persist into
the database. For example, it prefixes every summary with `Summary:`. We apply a
few preprocessing steps to every summary to keep things uniform. The steps,

1. Remove leading `Summary:` from the input text
2. Split any newlines created by unordered lists in the input text
3. Remove leading `- ` from the split unordered lists
4. Remove any remaining whitespace
5. Put everything back together separated with spaces
"""

import re


def normalize_summary(summary: str) -> str:
    strip_summary = re.sub(r"^Summary:", "", summary)
    lines = strip_summary.splitlines()
    handle_list_items = [re.sub(r"^- ", "", x) for x in lines]
    handle_remaining_whitespace = [
        x.strip() for x in handle_list_items if x.strip() != ""
    ]
    return " ".join(handle_remaining_whitespace)
