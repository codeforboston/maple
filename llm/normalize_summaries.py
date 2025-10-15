import re


def normalize_summary(summary: str) -> str:
    strip_summary = re.sub(r"^Summary:", "", summary)
    lines = strip_summary.splitlines()
    handle_list_items = [re.sub(r"^- ", "", x) for x in lines]
    handle_remaining_whitespace = [x.strip() for x in handle_list_items if x.strip() != ""]
    return " ".join(handle_remaining_whitespace)
