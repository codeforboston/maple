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

**bills** is built in two steps. The documents come from the committed emulator
fixture; the LLM `summary` field is joined in from a live project afterwards,
because the fixture was captured before the trigger in `llm/` existed and has a
summary for exactly 0 of its 7,337 bills:

```bash
yarn search-eval:corpus                                            # 7,337 bills, ~15s
yarn search-eval enrich --env prod --alias bills --field summary
```

Re-exporting bills from prod wholesale is the obvious alternative and it is
wrong. Court 192 closed in 2022, so prod's copy of it has drained out of its
policy committees — 36 distinct `currentCommittee` values in the fixture against
21 in prod, with none left in Revenue at all, which deletes `mc-013` outright and
costs member-committee 0.864 → 0.739. Joining the one missing field keeps every
other value frozen, so the control run reproduces the previous baseline exactly
and the field under test is the only thing that moved.

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

Bills needs one extra step. Its rule is path-scoped to `generalCourts/**` and
does not grant collection-group scope, so an unauthenticated
`collectionGroup("bills")` read is denied — but `generalCourts/192/bills` is a
plain collection read inside that scope and is allowed. `--court` substitutes
each general court for the trigger's `{court}` wildcard, turning the one denied
read into three permitted ones; `enrich` defaults it to the courts the corpus
already holds, since any other court's documents would only be discarded. Paging orders by `__name__` rather than the
config's id field, because prod carries a single-field index exemption on bills'
`id` and ordering by it fails with `failed-precondition`.

All three corpora are **committed**, because none can be rebuilt byte-for-byte
from what the repo holds: they are snapshots of a moving source, and
re-exporting tomorrow gives a different md5. Committing pins the eval to one
snapshot, and refreshing it becomes a deliberate act. hearings and
publishedTestimony are small (126 KB and 992 KB gzipped); bills is 10 MB, the
price of carrying `body` for 7,337 bills.

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

| collection         | queries | nDCG@10 | weakest categories                |
| ------------------ | ------- | ------- | --------------------------------- |
| bills              | 82      | 0.752   | topic 0.500, misspelling 0.507    |
| hearings           | 48      | 0.957   | synonym 0.810, agenda-topic 0.842 |
| publishedTestimony | 39      | 0.980   | misspelling 0.943, topic 0.971    |

Landed and measured: the legislative synonym set on hearings and testimony
(synonym 0.000 → 0.810 and 0.673 → 0.968), bill-number variants on testimony
(bill-id 0.848 → 1.000), hyphen tokenization on all three (bills
hyphenation 0.574 → 0.955, testimony topic +0.083), synonym head terms
for `alcohol`/`climate`/`vehicles` (#90) on all three (bills 0.766 → 0.754,
a known and accepted cost — see below; hearings and testimony unaffected),
bill pinslip at weight 3 (#87, bills 0.753 → 0.755, topic recall@10 +0.025),
the LLM bill summary at weight 2 (#76, bills 0.737 → 0.739 with recall@10
0.860 → 0.880 and the new `plain-language` category 0.508 → 0.569), and sorting
procedural orders below everything else (#95, bills 0.739 → 0.752,
member-committee 0.864 → 0.934, nothing else moved at all).

The bills row keeps dropping while bills search keeps improving, because each
change also adds queries the previous number never had to answer. Compare
baselines, not rows: the honest "before" for #76 is
`bills-summary-control.json`, the previous ranking config re-run against the new
corpus and the new goldens. `bills-pinslip.json` and everything older is not
comparable to it. Any change that moves the corpus md5 or the goldens needs the
same treatment.

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
- **A category cannot reward what it never asks for.** Hyphen tokenization first
  measured at −0.002 on bills, because none of the 70 bills queries contained a
  hyphenated phrase: the goldens could see the rank reshuffle it caused but not
  the matches it unlocked. Six `hyphenation` queries later, the same change
  measured +0.028 overall and +0.381 on that category. When a change scores
  slightly negative, check whether anything in the set actually exercises it
  before believing the number.
- **Typo tolerance masks synonym defects.** `liquor` appeared to reach the
  "Alcohol" hearings, but only because the expansion "alcoholic" is two edits
  from "alcohol"; at `num_typos=0` it found nothing. The actual defect (#90):
  legislative synonym sets omitted their own head term (`alcohol`, `climate`,
  `vehicles` were never in their own `synonyms` array), so a query for the
  head term never triggered the group at all. Fixed by adding the head term
  to each array. Verify synonym work with typos off, or a broken set will
  look healthy.
- **Mixing single-word and multi-word entries in one synonym group inflates
  single-word matches.** Fixing #90 above dropped bills' `liquor` golden
  (`syn-009`) from 1.000 to near-zero nDCG, and it isn't a golden-coverage
  gap like the hyphenation case — it's a real Typesense scoring quirk, traced
  to source. For a single-token query, `words_present` credit for a
  synonym-matched document is `syn_orig_num_tokens` — the _maximum_ token
  length across every member of the resolved synonym group, not the length
  of what actually matched (`index.cpp`, `score_results2` /
  `syn_orig_num_tokens` computation). The `alcohol` group has two 2-word
  phrases (`"alcoholic beverages"`, `"alcoholic beverage"`), so every
  single-word match in that group — e.g. "alcohol" when you search "liquor"
  — is credited as if 2 words matched, while the literal query match stays
  correctly at 1. That component sits in the highest bits of `_text_match`,
  so it dominates: general "alcohol" bills outrank literal "liquor" bills
  wholesale, confirmed by decoding the raw scores and by reproducing/clearing
  the effect with a stripped-down synonym set. `demote_synonym_match` does
  not fix this — it operates on the lowest bits of the same score and never
  gets a chance to matter. There's no clean fix: dropping the phrase entries
  removes the inflation, but 62 of the 63 bills that say "alcoholic
  beverage(s)" don't separately say "alcohol" or "liquor" anywhere, so that
  would trade a scoring quirk for real lost recall. Kept the group as-is and
  updated `syn-009` to grade literal `liquor`/`alcoholic beverage` matches at
  3 and general `alcohol` matches at 1, reflecting genuine relevance rather
  than the old (accidentally-narrow) expectation — nDCG on that query stays
  low (0.143) because the _ranking_ is still quirky, but recall and MRR
  correctly show the fix works. `vehicles` mixes `"motor vehicle(s)"` the
  same way, but that regression (`hyp-005`, a 3-token query) isn't this bug —
  the inflation formula only fires for single-token queries — and doesn't have
  a known fix either; documented as an accepted cost.
- **Rule-based judgments are biased against any field they don't name.** Every
  bills `topic` golden grades relevance with `title`-contains rules plus one or
  two hand-picked `docId`s, so a bill with a thin title and a topical pinslip
  is grade 0 — outside both the numerator and the denominator. When #87 added
  pinslip to `query_by`, promoting exactly those bills _displaced_ title-matching
  grade-1 docs, and the score fell where the change was working. This is the
  hyphenation bullet's evil twin: there the goldens were blind to the change,
  here they penalise it. The remedy is to measure before grading — run the
  candidate against the unchanged goldens, diff the top-10s against a control,
  and hand-grade only what actually moved. Widening the rules instead (say to
  `anyField: ["title","pinslip"]`) is the tempting shortcut and the wrong one:
  it rewards the field under test by construction.
- **`misspelling` is not an independent category on bills.** 8 of its 10
  queries score _identically_ to the `topic` query they `sameAs`, because typo
  tolerance fully recovers the query before ranking ever happens. It measures
  topic's ordering a second time rather than testing typo handling, so a topic
  movement double-counts into the overall number. Read the two together, and
  don't describe a change as fixing two weak categories when it fixed one.
- **A new field's damage can be a document problem, not a ranking problem.**
  Indexing the LLM `summary` cost member-committee 0.864 → 0.831, and `mc-014`
  ("Education Committee") collapsed 0.558 → 0.064. None of it was the summaries.
  The six documents it promoted were all procedural — "Extension Order -
  Education", "Order relative to authorizing the joint committee on Education to
  make an investigation and study" — and they already matched a committee query
  in title, pinslip and body. A fourth matching field was enough, because
  `fields_matched` sits in the lowest bits of `_text_match` and breaks ties.
  Withholding `summary` from Orders puts the member-committee delta at exactly
  0.000 and leaves `mc-014` identical to the control, with the whole
  plain-language gain intact. Two rounds of weight tuning and a ranker-mode
  change all failed to buy back what one line in `convert` fixed. Before tuning
  weights against a regression, look at _which documents_ moved.

  `content.LegislationTypeName` is the marker: a court is roughly 10% non-Bill
  (prod's 192 is 7,780 Bill, 332 Order, 185 Extension Order, 166 Amendment, 74
  Resolve, and nine rarer types). Only Order and Extension Order are withheld —
  Resolves and constitutional amendment proposals are legislation people search
  for, so "Bill or nothing" would be the wrong cut. Dropping procedural
  documents from the index altogether is worth a further +0.010 before any
  ranking change, and member-committee 0.864 → 0.920, but it makes them
  unfindable by number: a product decision, tracked separately.

- **Demote procedural documents; do not drop them.** The follow-up to the
  bullet above. `billsRelevanceSort` opens with
  `_eval(legislationType:!=[\`Order\`,\`Extension Order\`]):desc`, which sorts every
procedural document below every other one. Measured against dropping them from
the index outright: demotion 0.752 overall / member-committee 0.934, deletion
0.749 / 0.920. Demotion wins on the number *and* keeps the documents
reachable, so there is no case left for a `config.filter` here. Three queries
  moved, all up — mc-015 +0.727, mc-013 +0.220, mc-014 +0.107 — and the other 79
  are byte-identical.

  Two things the goldens cannot tell you about it, both checked by hand. Lookup
  by number survives: no bill shares an order's number, so `H4394` still returns
  the Extension Order at rank 1 even though its whole class is demoted. Searching
  for the type by name does not: "Extension Order Education" puts bills first and
  the real orders at rank 26 of 32. Every `exact-bill-id` golden names a real
  Bill, so the set could not have caught either. That second cost is why the
  `legislationType` refinement ships with the sort rather than after it —
  refining to the type lifts the demoted class back.

- **`text_match_type: max_weight` is a dead end here, and the reason is
  instructive.** It looks like the fix for the tiebreak above, and on "zero
  emission vehicles" it is. But it scores a document off the highest-_weighted_
  matching field even when a lower-weighted field matched far better. Read off
  `text_match_info` for "Education Committee": a bill in that committee matches
  `currentCommittee` with `best_field_score` 2211897868289, while a study order
  matches `title` more loosely at 2211897802753 — the committee match is 65,536
  (2^16, one step in the positional component) better. `max_score` keys on that
  score and ranks the bill first; `max_weight` keys on the weight index (title
  14, currentCommittee 11) and ranks the order first. Raising `currentCommittee`
  above `title` to compensate breaks the opposite case: "renewable energy" then
  scores every bill in the Energy committee off the words "and Energy" in its
  committee name, 24 documents share one score, and `testimonyCount` decides the
  top of the list. The same field pair needs opposite priority for committee and
  topic queries, so no weight ordering satisfies both — only a mode that asks
  which field actually matched better can, which is what `max_score` does.

- **The `plain-language` category exists because the other 76 queries could not
  ask the question.** Summaries restate a bill in everyday words; every other
  bills category is phrased in the legislature's vocabulary, so the change they
  measured was dilution, not benefit. Six plain-language queries later, the same
  change reads +0.061 nDCG, +0.100 recall@10 and +0.111 MRR on the category.
  The gain is concentrated: `pl-001` "tenants facing eviction" goes 0.247 →
  0.613 because the control only _retrieves_ four documents for it — two of them
  clean-energy bills — while summaries bring the real eviction bills into the
  candidate set. That is a retrieval win, not a reranking one, which is why
  recall@10 moves further than nDCG@10 everywhere in this change. Their ground
  truth was identified from `title`/`pinslip`/`body` only, never from `summary`,
  so the relevant sets are not derived from the field under test.

  `pl-004` "property tax break for solar" scores 0.000 in every configuration
  measured, including the control. "property tax exemption solar" returns both
  target bills at ranks 1 and 2. That is a _tax break_/_tax exemption_
  vocabulary gap and a candidate for the legislative synonym set — the category
  found a defect it was not looking for, which is the argument for keeping
  queries that fail.

- **Long fields are topic-agnostic magnets.** Twenty bills (0.3%) are
  procedural study orders whose `Pinslip` is not a description but a
  concatenated docket of every petition referred to a committee — up to 28,049
  characters against a median of 224. Indexed whole, they matched nearly any
  topical query: a search for "eviction" surfaced the Judiciary study order at
  rank 6. `convert` now drops a pinslip over 2000 characters, which restored
  real bills to those slots ("An Act promoting housing stability and
  homelessness prevention" for eviction, "An Act creating a youth wage" for
  minimum wage). The headline metric barely moved — both the noise and its
  replacement were ungraded — so this one is visible in the top-10 diffs and
  almost invisible in the score. Read the diffs.
