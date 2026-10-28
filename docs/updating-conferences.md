# Updating conference committees

Each committee of conference is one YAML file under `conferences/{court}/`,
synced to `generalCourts/{court}/conferences/{id}` in Firestore. The sync refuses a
file unless its folder is its `court` and its name is its `id`, the URL slug. See
`conferences/194/student-learning-and-mental-health.yaml` for a complete file.

## Adding a conference

```sh
yarn firebase-admin run-script findConferences --env dev --out conferences
```

This drafts each conference that doesn't have a file yet. Finish each draft by hand:

1. Resolve every `TODO` (conferee member codes, the partner bill).
2. Check `status` against the conference report bill, because the guess stops at "Reported by".
3. Add `hearingIds` (`hearing-{EventId}`) from the hearing list the script prints.
4. Write the `gist`, then `differences` and `similarities`, each with a `source`. Leave out a chamber's text when its bill doesn't touch the point.

## Updating a conference

Edit the YAML and sync. Deleting a file deletes its document on the next sync.

## Syncing

```sh
yarn firebase-admin run-script syncConferences --env dev --dry-run
yarn firebase-admin run-script syncConferences --env dev
```

If any file is invalid, the sync writes nothing. Missing bills and members only produce warnings.

## Fields that bite

- `canonicalBillId`: the bill whose history has the appointment actions. Testimony is filed on it.
- `chair`: set it on the member named first for their chamber in the appointment.

Everything else is in the `Conference` runtype in `functions/src/conferences/types.ts`.

## Local data

Fetch the real bills into the emulator before syncing locally:

```sh
yarn firebase-admin run-script fetchBills --env local --court 194 --bills "S2581 H5366"
```
