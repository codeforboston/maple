# Updating Ballot Questions

This guide explains how to update ballot question data in the Maple platform using the admin scripts.

## Prerequisites

- Node.js / yarn installed (`yarn install` to get all deps including `@swc/core`)
- For `local`: Firebase emulators running (`yarn emulators:start`)
- For `dev` / `prod`: a Google service account key, either in `GOOGLE_APPLICATION_CREDENTIALS` or passed via `--creds <path>`

## Syncing Ballot Questions from YAML

The `syncBallotQuestions` script upserts ballot question records from local YAML files into the `ballotQuestions` Firestore collection. Each file is validated against the `BallotQuestion` type before being written; invalid files abort with an error. All writes are committed atomically in a single Firestore batch.

**Important:** Persisted testimony counters on existing ballot-question documents are preserved during sync so YAML refreshes do not wipe live testimony data.

### Running the Script

```sh
# Uses ./ballotQuestions/ directory by default
yarn firebase-admin run-script syncBallotQuestions --env local

# Specify a custom directory
yarn firebase-admin run-script syncBallotQuestions --env dev -- --dir /path/to/yaml-dir

# With explicit credentials (for dev/prod)
yarn firebase-admin run-script syncBallotQuestions --env prod --creds /path/to/key.json
```

### YAML Schema

YAML files must export a document whose shape matches the `BallotQuestion` type defined in `functions/src/ballotQuestions/types.ts`, including a top-level `id` field used as the Firestore document ID.

#### Required Fields

- `id`: Unique identifier (e.g., "23-36") — used as the Firestore document ID
- `title`: Official ballot question title
- `court`: Judicial court number (e.g., 193 for SJC)
- `type`: Question type (e.g., "initiative_statute", "special_law")
- `ballotStatus`: Current status (e.g., "accepted", "rejected", "pending")
- `ballotQuestionNumber`: Position on the ballot (e.g., 2)
- `electionYear`: Year of the election (e.g., 2024)

#### Optional Fields

- `billId`: Related bill identifier if applicable
- `relatedBillIds`: Array of related bill IDs
- `description`: Short description of what the question is about
- `atAGlance`: Array of label/value pairs for quick facts
  - Each item has `label` (e.g., "What it does") and `value` (e.g., "Removes MCAS...")
- `voteEffectYes`: Explanation of what a YES vote means
- `voteEffectNo`: Explanation of what a NO vote means
- `fiscalConsequences`: Expected fiscal impact
- `inFavor`: Arguments in support
- `against`: Arguments in opposition
- `campaignFinancials`: Campaign finance data with `support` and `oppose` arrays
  - Each committee entry has `committee`, `cashRaised`, `spent`, `inKind`
- `fullSummary`: Official summary text from the voter guide
- `pdfUrl`: URL to official voter guide PDF
- `alertFlag`: Optional notice text with Markdown link support (renders as a bright header banner)
- `alertTip`: Optional tooltip text to accompany the alert

#### Example YAML

```yaml
id: "23-36"
billId: "H4252"
title: "Elimination of MCAS as High School Graduation Requirement"
court: 193
electionYear: 2024
type: initiative_statute
ballotStatus: accepted
ballotQuestionNumber: 2
relatedBillIds: []
description: "Would replace the MCAS graduation requirement with district-certified coursework mastery."
atAGlance:
  - label: "What it does"
    value: "Removes MCAS as a graduation requirement."
voteEffectYes: "A YES vote would replace the MCAS graduation requirement with district-certified coursework mastery."
voteEffectNo: "A NO vote would make no change in the law governing the MCAS graduation requirement."
fiscalConsequences: "The proposed law has no discernible material fiscal consequences for state and municipal government finances."
inFavor: "..."
against: "..."
campaignFinancials:
  support:
    - committee: "Committee name"
      cashRaised: 950000
      spent: 950000
      inKind: 15604360.49
  oppose: []
fullSummary: "Official summary text from the voter guide."
pdfUrl: "https://..."
alertFlag: "Legal challenge pending. [Read more](https://example.com)."
alertTip: "This question may not appear on the ballot."
voteEffectYes: "..."
voteEffectNo: "..."
fiscalConsequences: "..."
inFavor: "..."
against: "..."
```

## Backfilling Testimony Counters

The `backfillBallotQuestionTestimonyCounts` script computes and stores `testimonyCount`, `endorseCount`, `neutralCount`, and `opposeCount` on every ballot-question document from published testimony.

This is useful after syncing new ballot questions to populate their initial testimony counts.

```sh
yarn firebase-admin run-script backfillBallotQuestionTestimonyCounts --env local
yarn firebase-admin run-script backfillBallotQuestionTestimonyCounts --env dev
yarn firebase-admin run-script backfillBallotQuestionTestimonyCounts --env prod
```

The script is idempotent — it overwrites only the four counter fields based on current published testimony, so it is safe to re-run.

## Field Reference

For detailed documentation of each ballot question field, see [ballot-questions-field-descriptions.md](./ballot-questions-field-descriptions.md).
