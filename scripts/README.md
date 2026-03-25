# Admin Scripts

One-off migration, seeding, and administrative scripts for the Maple platform. These are not part of the deployed application — they run locally against a target environment (local emulators, dev, or prod).

## Prerequisites

- Node.js / yarn installed (`yarn install` to get all deps including `@swc/core`)
- For `local`: Firebase emulators running (`yarn emulators:start`)
- For `dev` / `prod`: a Google service account key, either in `GOOGLE_APPLICATION_CREDENTIALS` or passed via `--creds <path>`

---

## Firebase Admin Scripts

Scripts in `scripts/firebase-admin/` share a common CLI dispatcher (`index.ts`) that initialises a Firestore `db`, Firebase `auth`, and related helpers before running the named script.

### Running a script

```sh
yarn firebase-admin run-script <script-name> --env <local|dev|prod> [-- <script-specific args>]

# With explicit credentials (for dev/prod)
yarn firebase-admin run-script <script-name> --env prod --creds /path/to/key.json

# Interactive REPL (db, auth, etc. in scope)
yarn firebase-admin console --env local
```

### Scripts

#### `backfillTestimonyBallotQuestionId`

Stamps `ballotQuestionId: null` onto every `publishedTestimony` and `archivedTestimony` document that is missing the field.

**Why it exists:** The composite Firestore index used by `resolvePublication()` (which queries by `billId + court + ballotQuestionId`) excludes documents where an indexed field is absent. Without this backfill, re-publishing legacy testimony creates a duplicate record instead of updating the existing one.

**Idempotent:** Documents that already have the field set (to any value) are skipped, so it is safe to re-run.

**When to run:** Once against each environment after deploying the ballot-questions feature. Can be deleted from the codebase once confirmed executed everywhere.

```sh
yarn firebase-admin run-script backfillTestimonyBallotQuestionId --env local
yarn firebase-admin run-script backfillTestimonyBallotQuestionId --env dev
yarn firebase-admin run-script backfillTestimonyBallotQuestionId --env prod
```

---

#### `syncBallotQuestions`

Upserts ballot question records from local YAML files into the `ballotQuestions` Firestore collection. Each file is validated against the `BallotQuestion` type before being written; invalid files abort with an error. All writes are committed atomically in a single Firestore batch.

```sh
# Uses ./ballotQuestions/ directory by default
yarn firebase-admin run-script syncBallotQuestions --env local

# Specify a custom directory
yarn firebase-admin run-script syncBallotQuestions --env dev -- --dir /path/to/yaml-dir
```

YAML files must export a document whose shape matches the `BallotQuestion` type defined in `functions/src/ballotQuestions/types.ts`, including a top-level `id` field used as the Firestore document ID.

---

#### `backfillBillCourt`

<!-- TODO: document -->

#### `backfillBillNotificationEvents`

<!-- TODO: document -->

#### `backfillHearingTranscription`

<!-- TODO: document -->

#### `backfillNextDigestAt`

<!-- TODO: document -->

#### `backfillOrganizationTestimony`

<!-- TODO: document -->

#### `backfillPublishedTestimonyId`

<!-- TODO: document -->

#### `backfillTestimonyBillTitle`

<!-- TODO: document -->

#### `backfillUserRoles`

<!-- TODO: document -->

#### `backfillWeeklyFrequency`

<!-- TODO: document -->

#### `batchDeleteTestimony`

<!-- TODO: document -->

#### `generateBill`

<!-- TODO: document -->

#### `generateBillHistory`

<!-- TODO: document -->

#### `list-all-users`

<!-- TODO: document -->

#### `migrateHearingTranscription`

<!-- TODO: document -->

#### `runScrapers`

<!-- TODO: document -->

#### `seedActiveTopicSubscriptions`

<!-- TODO: document -->

#### `seedTopicEvents`

<!-- TODO: document -->

#### `sendTestEmail`

<!-- TODO: document -->

#### `touchBills`

<!-- TODO: document -->

#### `updateDisplayNames`

<!-- TODO: document -->

#### `updateHistory`

<!-- TODO: document -->

---

## Typesense Admin

Manages the Typesense search index. Integrates with Firebase secrets to retrieve API keys.

```sh
yarn typesense-admin <command> --env <local|dev|prod>
```

### Commands

<!-- TODO: document commands (console, create-search-key, list-keys, delete-key) -->

---

## `generate-stories`

<!-- TODO: document -->

---

## `setRole` (quick alias)

A convenience alias for the `setRole` firebase-admin script. See the script entry above.

```sh
yarn setRole --env <local|dev|prod> [args]
```

<!-- TODO: document arguments -->

---

## CI test

The `integration_tests` job in `.github/workflows/repo-checks.yml` runs `backfillTestimonyBallotQuestionId` end-to-end via `yarn firebase-admin run-script` against the Firebase emulator to verify the CLI runner is working. This covers the full path: ts-node compilation, `run-script` dispatch, dynamic script loading, and Firestore writes.
