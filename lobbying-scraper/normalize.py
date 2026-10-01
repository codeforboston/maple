"""Entity name normalization pipeline.

Mirrored in functions/src/lobbying/normalize.ts. Steps must be applied in
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

# Descriptive phrases dropped so variants of one firm's name group together
# ("Smith, Costello & Crawford" / "... Public Policy Group, LLC").
_MISC_PHRASES = [
    "LAW OFFICE OF",
    "AND ASSOCIATES",
    "AND ASSOC",
    "ATTORNEY AT LAW",
    "AND PARTNERS",
    "PUBLIC POLICY GROUP",
    "LEGISLATIVE SERVICES",
    "POLICY GROUP",
    "ASSOCIATES",
    "COUNSELLORS AT LAW",
]
_MISC_RES = [re.compile(rf"\b{p}\b") for p in _MISC_PHRASES]
_GLUED_ASSOCIATES_RE = re.compile(r"(\w)(ASSOCIATES)\b")
_TYPOS = [
    (re.compile(r"\bASSICIATES\b"), "ASSOCIATES"),
    (re.compile(r"\bATTORNET\b"), "ATTORNEY"),
]
_AND_ASSOCIATES_RE = re.compile(r"\bAND ASSOC(IATES)?\b")


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
    x = x.replace("&", " AND ")           # 7. ampersand → AND (spaced: "A&B")
    x = x.replace("ATTORNEY@LAW", "ATTORNEY AT LAW")
    x = _GLUED_ASSOCIATES_RE.sub(r"\1 \2", x)  # 8. "JAJUGAASSOCIATES"
    for typo, fix in _TYPOS:              # 9. known portal typos
        x = typo.sub(fix, x)
    base = _WS_RE.sub(" ", x).strip()
    stripped = base
    for phrase in _MISC_RES:               # 10. remove descriptive phrases...
        stripped = phrase.sub(" ", stripped)
    stripped = _WS_RE.sub(" ", stripped).strip()
    # ...unless that leaves a bare surname, which would merge different firms
    # (Delaney Associates, Delaney Legislative Services, Delaney Policy Group).
    if len(stripped.split()) < 2:
        return _AND_ASSOCIATES_RE.sub("ASSOCIATES", base)
    return stripped
