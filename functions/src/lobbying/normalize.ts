/**
 * Entity name normalization pipeline.
 *
 * The SoS portal does not enforce consistent name formatting. The same client or
 * registrant may appear as "Acme Corp.", "ACME CORPORATION", "Acme, Inc. d/b/a
 * Acme Consulting", etc. across filings and years.
 *
 *  The steps must be applied in the exact order
 * listed here; changing the order produces different (incorrect) output.
 */

// Step 2: strip d/b/a trade-name suffix before any other transforms so the
// trade name doesn't bleed into the canonical form.
const DBA_RE = /\s+D\s*\/+B\s*\/+A?\s+.*|\s+DBA\s+.*/i

// Step 5: remove legal entity type words with whole-word matching so
// "INCORPORATED" and "CORP" are caught in addition to "LLC"/"INC".
const LEGAL_ENTITY_RE =
  /\b(LLC|LLP|INC|INCORPORATED|CORPORATION|CORP|LTD|LIMITED|PC|PLLC)\b/g

// Step 6: remove "THE" as a whole word anywhere (not just as a leading prefix).
const THE_RE = /\bTHE\b/g

// Descriptive phrases dropped so variants of one firm's name group together
// ("Smith, Costello & Crawford" / "... Public Policy Group, LLC").
const MISC_PHRASES = [
  "LAW OFFICE OF",
  "AND ASSOCIATES",
  "AND ASSOC",
  "ATTORNEY AT LAW",
  "AND PARTNERS",
  "PUBLIC POLICY GROUP",
  "LEGISLATIVE SERVICES",
  "POLICY GROUP",
  "ASSOCIATES",
  "COUNSELLORS AT LAW"
]
const MISC_RES = MISC_PHRASES.map(p => new RegExp(`\\b${p}\\b`, "g"))
const GLUED_ASSOCIATES_RE = /(\w)(ASSOCIATES)\b/g
const TYPOS: [RegExp, string][] = [
  [/\bASSICIATES\b/g, "ASSOCIATES"],
  [/\bATTORNET\b/g, "ATTORNEY"]
]
const AND_ASSOCIATES_RE = /\bAND ASSOC(IATES)?\b/g

/** Mirrors normalize_entity_name in lobbying-scraper/normalize.py. */
export function normalizeEntityName(raw: string | null | undefined): string {
  if (!raw) return ""

  let x = raw.toUpperCase() // Step 1: uppercase

  x = x.replace(DBA_RE, "") // Step 2: strip d/b/a suffix

  x = x.replace(/-/g, " ") // Step 3: hyphen → space

  // Step 4: punctuation → space (not empty string, so ",INC" → " INC" → caught
  // by step 5's whole-word removal).
  for (const ch of [",", ".", "'", "‘", "’", "(", ")"]) {
    x = x.split(ch).join(" ")
  }

  x = x.replace(LEGAL_ENTITY_RE, " ") // Step 5: remove legal entity type words

  x = x.replace(THE_RE, " ") // Step 6: remove THE anywhere

  x = x.replace(/&/g, " AND ") // Step 7: ampersand → AND (spaced: "A&B")
  x = x.split("ATTORNEY@LAW").join("ATTORNEY AT LAW")

  x = x.replace(GLUED_ASSOCIATES_RE, "$1 $2") // Step 8: "JAJUGAASSOCIATES"
  for (const [typo, fix] of TYPOS) x = x.replace(typo, fix) // Step 9: typos

  const base = x.replace(/\s+/g, " ").trim()
  let stripped = base
  for (const re of MISC_RES) stripped = stripped.replace(re, " ") // Step 10
  stripped = stripped.replace(/\s+/g, " ").trim()
  // Stripping descriptive words would leave a bare surname, which merges
  // different firms (Delaney Associates, Delaney Legislative Services, Delaney
  // Policy Group), so keep the descriptor in that case.
  if (stripped.split(" ").filter(Boolean).length < 2) {
    return base.replace(AND_ASSOCIATES_RE, "ASSOCIATES")
  }
  return stripped
}
