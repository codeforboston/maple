# Search relevance eval

Measures how well Typesense answers real queries, per collection, so search
changes ship with a number attached instead of a hunch.

Scored with capped recall@10, MRR and nDCG@10 (exponential gain) over a golden
query set, against a frozen corpus snapshot seeded into a dedicated local
collection. Harness lives in `scripts/search-eval`.

## The loop

The repo needs node 22; the usual machine default is 24 and plain `yarn` fails
the engine check.

```bash
export PATH="$HOME/.nvm/versions/node/v22.23.2/bin:$PATH"
yarn dev:up                                        # local Typesense on :8108
yarn typesense-admin upsert-synonyms --env local   # the "legislative" synonym set

yarn search-eval seed -e local --alias <alias>
yarn search-eval run  -e local --alias <alias> --out /tmp/candidate.json
yarn search-eval compare tests/search-eval/baselines/<baseline>.json /tmp/candidate.json
```

`--alias` is one of `bills` (the default), `hearings`, `publishedTestimony`.
`compare` exits non-zero when overall nDCG@10 drops by more than `--threshold`
(default 0.05) and lists per-query regressions.

To author or revise a golden set, `yarn search-eval label -e local --alias <a>`
writes `labeling-sheet-<alias>.md` — every query's top 10 as a gradeable table.
Grade 3 = exactly what the searcher wanted, 1 = relevant, 0/blank = not, then
merge the graded rows back as explicit `docId` entries.

Run `yarn check-types` as well as `yarn test`: jest transpiles differently and
hides errors the root tsconfig catches.

## Corpora

Each lives in `corpus/<alias>/` as `docs.jsonl.gz` + `schema.json` +
`meta.json`. `meta.json` pins the gzip's md5, and the harness refuses to run
against a corpus that does not match it. Documents are produced by the
**production converter** (`functions/src/*/search.ts`), so the eval indexes
exactly what the app's search pipeline would.

**bills** regenerates from the committed emulator fixture, so it is gitignored:

```bash
yarn search-eval:corpus     # 7,337 bills, ~15s
```

**hearings** and **publishedTestimony** cannot. The fixture holds ~21 hearings,
and its testimony content is lorem ipsum (`tests/seed/seedTestimony.test.ts`
generates it with `loremIpsum()` for 4 test users) — there is no real language
to match against. They come from a live project instead, and need **no
credentials**:

```bash
yarn search-eval corpus --env prod --alias hearings
yarn search-eval corpus --env prod --alias publishedTestimony --order-by publishedAt:desc
```

`firestore.rules` grants unauthenticated read on both sources — `events` is
"public, read-only" and publishedTestimony has an explicit
`match /{path=**}/publishedTestimony/{id}` rule so it can be read as a
collection group — so the web client SDK reads them with nothing but a project
id. `--env dev` works the same way against `digital-testimony-dev`.

Bills is the odd one out: its rule is path-scoped to `generalCourts/**` and does
not grant collection-group scope, so an unauthenticated `collectionGroup("bills")`
read is denied. That is why bills keeps the emulator path, where the admin SDK
bypasses rules.

Both corpora are **committed**, because they are snapshots of a moving source:
re-exporting tomorrow gives a different md5. Committing pins the eval to one
snapshot, and refreshing it becomes a deliberate act. They are small — 126 KB
and 992 KB gzipped.

Re-export when a converter changes what it emits. The corpus md5 moves with it,
and `compare` will warn that the run is not apples-to-apples. To keep such a
change measurable, re-run the _previous_ search config against the new corpus
first and use that as the control.

Two things the testimony corpus is not:

- **Complete history.** It is every published testimony prod holds (1,056 at
  time of writing), not a sample — but that is small next to bills' 7,337, and
  the court refinement narrows each query to one court's share. Absolute scores
  read higher than prod's full index would give; run-to-run deltas stay valid.
- **Unredacted.** `authorUid` becomes a stable hash and `fullName` is replaced
  by `authorDisplayName`. Neither is in any `query_by`
  (`components/search/searchParams.ts`), so nothing measured changes;
  `authorDisplayName` and `content` are kept verbatim because they are already
  published publicly and are what the eval scores. `meta.json` records which
  fields were rewritten.

## Golden sets

`goldens/<alias>.json`. Each query carries either `relevant` labels or a
`sameAs` pointer to a query it shares labels with (how misspellings reuse their
correctly-spelled twin). A label is an explicit `docId` or a `rule` resolved
against the corpus:

```json
{
  "id": "tt-001",
  "category": "topic",
  "query": "ranked choice voting",
  "relevant": [
    { "rule": { "field": "billId", "equals": "S531" }, "grade": 3 },
    { "rule": { "field": "content", "contains": "ranked choice" }, "grade": 1 }
  ]
}
```

Grades: **3** when the query names the thing exactly — a bill number, a
committee, an author, a location, a specific policy — and **1** when the
document is merely on the topic. A query whose labels are all one grade only
measures whether the right documents are found; mixing grades makes their
_order_ matter too, which is what the example above does: testimony on the
ranked-choice bill should outrank testimony that name-drops the phrase.

Rule values and document values are compared with everything but letters and
digits stripped, so `contains: "health care"` also matches "healthcare", and
`equals: "Cindy F. Friedman"` needs the indexed form, not the form a searcher
types. Two traps when writing rules:

- **Short `contains` values match inside words.** `contains: "gun"` matches
  "begun" — 54 false positives in the testimony corpus. Prefer a stem long
  enough to be unambiguous (`"incarcerat"`, `"disabilit"`).
- **A rule that resolves to nothing silently skips the query.** Check a
  candidate rule against the corpus before committing it.

`defaults.sort_by` must equal the collection's relevance sort exported from
`components/search/searchParams.ts`; `loadGoldens` throws otherwise. A golden
set scored under a sort no user can select measures an ordering nobody sees —
hearings was exactly that case until a relevance option was added, with every
sort date-ordered so nDCG measured recency.

`defaults.courtFilter` mirrors the app's court refinement, pinned to the
corpus's majority court — 192 for the bills fixture, 194 for both prod corpora.
It is the _only_ app refinement the eval mirrors: hearings also defaults
`hasVideo: ["true"]` in its initial UI state, which the eval ignores because it
shrinks the candidate pool without being a relevance knob.

### Prefer queries that can fail

Broad topics saturate. An early draft of the testimony `topic` category asked
for "housing", "climate", "education" and scored a flat **1.000** on all ten
queries: with 100+ relevant documents each, the top ten fills with relevant
documents whatever the ranking does, so the category could not have detected a
regression. Narrow queries with 3-25 relevant documents discriminate, because
then recall@10's denominator is the set size and a missed document costs real
score. Prefer "solitary confinement" and "same day voter registration" over
"prisons" and "voting".

## Baselines

`baselines/*.json` are committed scorecards, one per landed search change, each
recording the collection, server version, corpus md5 and git sha it was produced
from. Current:

| collection         | queries | nDCG@10 | weakest categories             |
| ------------------ | ------- | ------- | ------------------------------ |
| bills              | 70      | 0.752   | topic 0.497, misspelling 0.499 |
| hearings           | 48      | 0.957   | agenda-topic 0.842             |
| publishedTestimony | 39      | 0.940   | topic 0.861, misspelling 0.943 |

Hearings and testimony each landed two measured changes: the legislative synonym
set (synonym 0.000 → 0.810 and 0.673 → 0.968) and, for testimony only,
bill-number variants (bill-id 0.848 → 1.000).

### What these goldens have already settled

- **Weights are not a lever on either new collection.** Testimony's are inert:
  inverting them entirely (billId 10→1, content 3→10) changes 2 of 39 queries'
  top-10 and moves the score not at all, because its queries are field-disjoint
  in practice — a bill number only appears in `billId`, an author name only in
  `authorDisplayName`, topic words only in `content`. Hearings' are already
  optimal: every small perturbation scores exactly 0.957, and the only vectors
  that change anything drop `title` to or below `agendaTopics`, trading
  committee accuracy (0.978 → 0.903) for agenda-topic (0.842 → 0.924) at a net
  loss.
- **Hearings must not index bill-number variants.** Typesense pools tokens
  across a field's array elements, so on a multi-valued `billNumbers` the query
  "H 2391" matches a hearing whose agenda happens to list both an H-bill and an
  S2391 — `hearing-5226`, with 46 unrelated bills, becomes a false positive.
  Bills and testimony are safe: one variant per document, so tokens cannot
  combine across neighbours.
- **Typo tolerance masks synonym defects.** `liquor` appears to reach the
  "Alcohol" hearings, but only because the expansion "alcoholic" is two edits
  from "alcohol"; at `num_typos=0` it finds nothing. Verify synonym work with
  typos off, or a broken set will look healthy.
