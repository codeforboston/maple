# Updating conference committees

A committee of conference is the six-member House and Senate group appointed to
reconcile the two chambers' versions of a bill. MAPLE keeps one document per
conference at `generalCourts/{court}/conferences/{id}`, authored as YAML under
`conferences/{court}/{id}.yaml` and written by the sync script. The file name
is the id and the id is the URL slug.

The conference references its bills, conferees and hearings. Nothing is
written onto those documents; a page that starts from a bill asks the
conferences collection (`getConferenceForBill` in `components/db/conferences.ts`).

## Prerequisites

- `yarn install`
- For `local`: the emulators running (`yarn emulators:start`)
- For `dev` / `prod`: a service account key in `GOOGLE_APPLICATION_CREDENTIALS`
  or passed with `--creds <path>`

## Finding conferences

```sh
yarn firebase-admin run-script findConferences --env dev --out conferences
```

This is read-only. It scans every bill history in the current court for
`Committee of conference appointed`, pairs each bill with the other chamber's
last reprint before the appointment, resolves conferee surnames to member
codes, guesses a status from what follows, and writes a draft YAML per
conference (never overwriting one that exists). It ends with a list of hearings
whose description mentions a conference, for `hearingIds`. `--court` picks a
different court.

A person finishes the draft: anything the script could not resolve is left as
`TODO`; status needs checking on the conference report bill, since the
canonical bill's history stops at "Reported by"; and conference hearings are
linked by hand because they arrive with an empty agenda. Budget and
supplemental budget conferences and the joint rules order are listed but not
authored.

## Schema

Validated against `Conference` in `functions/src/conferences/types.ts`:

- `id`, `court`, `title`
- `senateBillId`, `houseBillId`, `canonicalBillId` (the bill whose history
  carries the appointments; testimony on the conference is filed against it)
- `conferees`: `{ memberCode, branch }`, three per chamber
- `status`: `appointed`, `reportFiled`, `enacted` or `dissolved`
- `hearingIds`: event document ids, `hearing-{EventId}`, as bills store them
- `differences`: `{ heading, senate, house, source? }`, what the chambers
  disagree on, written by journalists
- `similarities`: `{ heading, body, source? }`, where the texts match
- `source`: `{ organisation, url, publishedAt? }`

The count fields are owned by the testimony triggers; leave them out.

## Syncing

```sh
yarn firebase-admin run-script syncConferences --env local --dry-run
yarn firebase-admin run-script syncConferences --env dev
```

The sync writes every conference in YAML and deletes documents whose file is
gone. It refuses, writing nothing, if a file fails the runtype (including a
canonical bill that is neither of the pair), if two files share an id or a
bill, or if a conferee's branch disagrees with the member document; it warns
when a bill or member is not in the database. Counts on an existing document
are kept. `--dir` points at another directory.

## Local data

`fetchBills` queues a scraper batch for named real bills; the functions
emulator's `fetchBillBatch` fetches and writes them exactly as a scrape would:

```sh
yarn firebase-admin run-script fetchBills --env local --court 194 --bills "S3141 H5630"
```
