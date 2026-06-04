/**
 * Entity name normalization pipeline.
 *
 * The SoS portal does not enforce consistent name formatting. The same client or
 * registrant may appear as "Acme Corp.", "ACME CORPORATION", "Acme, Inc. d/b/a
 * Acme Consulting", etc. across filings and years.
 *
 * This pipeline is a direct port of the reference implementation used in the
 * companion data analysis project. The steps must be applied in the exact order
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

// Step 9: professional suffix phrases to remove wholesale.
const MISC_PHRASES = [
  "LAW OFFICE OF",
  "AND ASSOCIATES",
  "& ASSOCIATES",
  "AND ASSOC",
  "ATTORNEY AT LAW",
  "ATTORNEY@LAW",
  "ATTORNET AT LAW", // known portal typo
  "AND PARTNERS",
  "PUBLIC POLICY GROUP",
  "LEGISLATIVE SERVICES",
  "POLICY GROUP",
  "ASSOCIATES",
  "COUNSELLORS AT LAW"
]

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

  x = x.replace(/&/g, "AND") // Step 7: ampersand → AND

  x = x.replace("ASSICIATES", "ASSOCIATES") // Step 8: fix known portal typo

  // Step 9: remove professional suffix phrases
  for (const phrase of MISC_PHRASES) {
    x = x.split(phrase).join(" ")
  }

  x = x.replace(/\s+/g, " ").trim() // Step 10: collapse whitespace

  return x
}
