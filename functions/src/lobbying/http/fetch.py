"""Minimal HTTP fetch helper for the lobbying portal.

Handles the portal's session cookie requirements that standard Node.js HTTP
clients cannot satisfy due to TLS-layer constraints.

Usage:
    python3 fetch.py --url URL [--method GET|POST] [--jar PATH]

POST body is read from stdin as application/x-www-form-urlencoded.
Cookies are persisted to/from the JSON file at --jar so the session survives
across multiple subprocess invocations.
HTML response is written to stdout. Errors go to stderr with exit code 1.
"""

import argparse
import json
import sys
from pathlib import Path

import requests

_UA = (
    "Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) "
    "AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148"
)


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--url", required=True)
    p.add_argument("--method", default="GET", choices=["GET", "POST"])
    p.add_argument("--jar", default=None, help="Path to JSON cookie-jar file")
    args = p.parse_args()

    session = requests.Session()
    session.headers.update(
        {
            "User-Agent": _UA,
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
        }
    )

    if args.jar:
        jar = Path(args.jar)
        if jar.exists():
            try:
                session.cookies.update(json.loads(jar.read_text()))
            except Exception as e:
                print(f"warning: could not read cookie jar: {e}", file=sys.stderr)

    try:
        if args.method == "POST":
            body = sys.stdin.buffer.read()
            resp = session.post(
                args.url,
                data=body,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                timeout=180,
            )
        else:
            resp = session.get(args.url, timeout=60)

        resp.raise_for_status()

        if args.jar:
            Path(args.jar).write_text(json.dumps(dict(session.cookies)))

        sys.stdout.buffer.write(resp.content)

    except requests.exceptions.HTTPError as e:
        print(f"HTTP error {e.response.status_code}: {args.url}", file=sys.stderr)
        sys.exit(1)
    except requests.exceptions.RequestException as e:
        print(f"request failed: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
