"""Entity name normalization pipeline.

Direct port of functions/src/lobbying/normalize.ts. Steps must be applied in
this exact order — changing the order produces different (incorrect) output.
"""

from __future__ import annotations

import re

_DBA_RE = re.compile(r"\s+D\s*/+B\s*/+A?\s+.*|\s+DBA\s+.*", re.IGNORECASE)
_LEGAL_RE = re.compile(
    r"\b(LLC|LLP|INC|INCORPORATED|CORPORATION|CORP|LTD|LIMITED|PC|PLLC)\b"
)
_THE_RE = re.compile(r"\bTHE\b")
_WS_RE = re.compile(r"\s+")

_MISC_PHRASES = [
    "LAW OFFICE OF",
    "AND ASSOCIATES",
    "& ASSOCIATES",
    "AND ASSOC",
    "ATTORNEY AT LAW",
    "ATTORNEY@LAW",
    "ATTORNET AT LAW",  # known portal typo
    "AND PARTNERS",
    "PUBLIC POLICY GROUP",
    "LEGISLATIVE SERVICES",
    "POLICY GROUP",
    "ASSOCIATES",
    "COUNSELLORS AT LAW",
]


def normalize_entity_name(raw: str | None) -> str:
    if not raw:
        return ""
    x = raw.upper()                          # 1. uppercase
    x = _DBA_RE.sub("", x)                  # 2. strip d/b/a suffix
    x = x.replace("-", " ")                 # 3. hyphen → space
    for ch in (",", ".", "'", "‘", "’", "(", ")"):
        x = x.replace(ch, " ")             # 4. punctuation → space
    x = _LEGAL_RE.sub(" ", x)              # 5. remove legal entity words
    x = _THE_RE.sub(" ", x)               # 6. remove THE anywhere
    x = x.replace("&", "AND")             # 7. ampersand → AND
    x = x.replace("ASSICIATES", "ASSOCIATES")  # 8. fix known typo
    for phrase in _MISC_PHRASES:           # 9. remove professional suffix phrases
        x = x.replace(phrase, " ")
    x = _WS_RE.sub(" ", x).strip()        # 10. collapse whitespace
    return x
