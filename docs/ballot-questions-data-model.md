# Ballot Questions: Data Model

## Background

Massachusetts initiative petitions that qualify for the legislature are assigned H-bill numbers (H5000–H5010 in court 194) and referred to the **Special Joint Committee on Initiative Petitions (SJ42)**. They already exist in Maple's bill ingestion pipeline — the API treats them as regular bills with `PrimarySponsor: null`.

The ballot question feature adds a thin `/ballotQuestions` collection that gives each petition its own URL and voter-facing metadata, without touching bills, hearings, or testimony.

---

## Firestore Collection: `/ballotQuestions/{id}`

The document ID is the **petition number** (e.g. `25-14`), which is what mass.gov and voters recognize.

```typescript
interface BallotQuestion {
  id: string                 // petition number: "25-14"
  billId: string             // H-bill in the existing bills collection: "H5004"
  court: number              // General Court when referred: 194
  electionYear: number       // Target election year: 2026
  type: "initiative_statute" | "initiative_constitutional"
       | "legislative_referral" | "constitutional_amendment" | "advisory"
  ballotStatus: "legislature" | "ballot" | "enacted" | "failed" | "withdrawn"
  ballotQuestionNumber: number | null  // "Question 1" — null until SoS certifies
  relatedBillIds: string[]             // admin-curated, format: "194/H1234"
}
```

The page at `/ballotQuestions/[id]` fetches both this document **and** the bill at `billId` — title, full text, hearing schedule, and testimony all come from the bill. Nothing is duplicated.

---

## How petitions are identified in the API

Committee `SJ42` is stable across General Courts:

```
GET /GeneralCourts/{court}/Committees/SJ42
  → DocumentsBeforeCommittee   active petitions (current session)
  → ReportedOutDocuments       petitions the legislature has acted on
```

Both sets should have ballot question docs — past petitions remain discoverable.

---

## What requires manual entry

The MA Legislature API does not expose:

| Field | Reason |
|---|---|
| `ballotStatus: "ballot"` and beyond | Secretary of State process, not in legislature API |
| `ballotQuestionNumber` | Assigned by SoS when certified, not in API |
| Petition number (`25-14`) | Hearing descriptions are inconsistently formatted |

All fields are admin-controlled. With ~11 petitions per 2-year cycle this is minimal effort.

---

## Source of truth: YAML files

Ballot question documents are defined as YAML files committed to the repo:

```
ballotQuestions/
  25-14.yaml
  ...
```

```yaml
# ballotQuestions/25-14.yaml
id: "25-14"
billId: "H5004"
court: 194
electionYear: 2026
type: initiative_statute
ballotStatus: legislature
ballotQuestionNumber: null
relatedBillIds: []
```

A sync script (`scripts/firebase-admin/syncBallotQuestions.ts`) upserts these to Firestore. Git history is the audit trail; PRs provide review before changes go live.

### Running the sync script

The script is a manual admin operation, run against whichever environment you need:

```bash
# Local emulator
yarn firebase-admin -e local run-script syncBallotQuestions

# Staging
yarn firebase-admin -e dev run-script syncBallotQuestions

# Production (requires GOOGLE_APPLICATION_CREDENTIALS or gcloud ADC)
yarn firebase-admin -e prod run-script syncBallotQuestions
```

By default the script reads from `ballotQuestions/` at the repo root. To point it elsewhere:

```bash
yarn firebase-admin -e prod run-script syncBallotQuestions --dir=/path/to/yamls
```

The script validates each YAML against the `BallotQuestion` type (`functions/src/ballotQuestions/types.ts`) before writing and will throw on malformed input. Run it after adding or editing any YAML file.

---

## What does NOT change

- Bill documents — no new fields
- Bill ingestion — no changes
- Hearing sync — no changes
- Testimony — no changes; testimony targets `billId` directly

---

## Security

`firestore.rules` contains:

```
match /ballotQuestions/{id} {
  allow read: if true;
  allow write: if false;
}
```

**Why `write: if false` is correct here**

Firestore security rules only apply to browser clients (the Firebase JS SDK). The Admin SDK — used by the sync script — bypasses rules entirely. `write: if false` does not block the sync script; it blocks users from writing directly from their browser.

We don't need an admin role check (like `request.auth.token.get("role", "user") == "admin"` used elsewhere) because the only writer is the sync script. There's no admin UI for ballot questions, so a browser write of any kind is wrong.

---

## Queries & Indexes

### Listing page (`/ballotQuestions`)

Fetch all ballot questions for the current election year:

```ts
collection("ballotQuestions")
  .where("electionYear", "==", 2026)
```

Optionally filtered by status (e.g. "currently before legislature"):

```ts
collection("ballotQuestions")
  .where("electionYear", "==", 2026)
  .where("ballotStatus", "==", "legislature")
```

### Detail page (`/ballotQuestions/25-14`)

Direct document fetch — no query needed:

```ts
doc("ballotQuestions", "25-14")
```

Then a second fetch for the legislative data:

```ts
doc("generalCourts/194/bills", ballotQuestion.billId)
```

### Indexes

Firestore auto-indexes single fields. Composite indexes (multiple fields in one query) must be declared in `firestore.indexes.json`.

The listing query (`electionYear == 2026`) is a single equality filter — Firestore handles it automatically. The filtered listing adds a second field, so it needs a composite index.

`firestore.indexes.json` already declares this index:

```json
{
  "collectionGroup": "ballotQuestions",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "electionYear", "order": "ASCENDING" },
    { "fieldPath": "ballotStatus", "order": "ASCENDING" }
  ]
}
```

With ~11 documents Firestore would be fast without the index, but declaring it is correct practice and prevents a runtime error if someone adds `.orderBy()` later.
