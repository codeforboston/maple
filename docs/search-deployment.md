# Deploying the 2026 search relevance work

Four merges, in this order. Nothing is run by hand: every step is a merge that a
pipeline picks up.

## Dev

1. Merge the infra PR pointing dev's Typesense at 30.2. maple-testimony/infra
   deploys itself on push to main through the maple-cicd CodePipeline. When it
   finishes, dev is running 30.2 and its index is empty.

2. Merge the search branch to main in codeforboston/maple. deploy-backend-dev.yml
   deploys the functions and publishes checkSearchIndexVersion, which starts the
   reindex and upserts the synonym set server-side (the functions hold the
   Typesense key; CI never does), and Vercel builds the frontend from the same
   commit. Dev search comes back when the reindex finishes; bills takes longest,
   at roughly 49,000 documents.

Confirm with `yarn typesense-admin status --env dev`, which prints each alias,
the collection it points at and its document count, and the synonym sets the
server holds — `legislative` with its item count should be there.

## Watching a reindex

A reindex is a chain of chunks, not one long function call, so it is visible
while it runs and it resumes where it stopped. `yarn firebase-admin run-script
searchUpgradeStatus --env dev` prints each alias's run: status, target
collection, documents and batches so far, and the cursor it is working from. A
cursor that advances between two calls is a healthy run; one that does not, with
a `last error`, is a stuck one. `typesense-admin status` shows the same run from
the Typesense side — a growing `(orphan)` collection is the backfill filling its
new collection before the alias moves.

Bills takes the longest and spans several chunks. Nothing needs retriggering: a
chunk that times out or fails is retried from its own cursor.

## Prod

The same shape, but as separate PRs, and prod search is down between the two
steps. Schedule it and say so beforehand.

3. Merge the infra PR pointing prod's Typesense at 30.2. Same pipeline. Prod's
   index is now empty and prod search is down.

4. Merge main to the prod branch in codeforboston/maple. This is the same code
   already running on dev, and deploy-prod.yml does what step 2 did. Prod search
   comes back when the reindex finishes.

Confirm with `yarn typesense-admin status --env prod`.

Two things fail quietly. A missing synonym set makes `synonym_sets: "legislative"`
resolve to nothing, and relevance regresses with no error — deploys re-upsert the
set from inside checkSearchIndexVersion so it cannot be forgotten, but if that
invocation fails the gap reopens; `typesense-admin status` prints the server's
synonym sets, so the confirm step catches it. And
components/search/common.tsx falls back to the hardcoded dev cluster when
`NEXT_PUBLIC_TYPESENSE_*` are unset, so a misconfigured prod frontend searches dev
and looks healthy. Check the Vercel variables before step 4, not after.
