# Ballot Questions — Frontend Architecture

## Overview

This document describes how to build the ballot question detail page (`/ballotQuestions/[id]`). The backend is complete (Firestore collection, security rules, indexes, types, sync script, db query methods). This document covers the UX architecture, data flow, component reuse map, and the UI changes needed when the page is built.

---

## Page layout: `/ballotQuestions/[id]`

The page is divided into a header card and a two-column section below it. Only the **Overview** and **Testimonies** tabs need to be wired for the initial build. The remaining nav items (Synthesis & Insights, For & Against, News & Media, Academia, Campaign Financials, Map) are placeholders.

```
┌─────────────────────────────────────────────────────────────────┐
│  « Return to ballot questions                    [Follow]        │
│                                                                   │
│  Question N  |  Short name                   ┌──────────────────┐│
│  Type: Law ⓘ                                 │  Your Testimony  ││
│                                               │                  ││
│  Full title (large)                           │  [Create         ││
│                                               │   testimony]     ││
│  ┌──────────────────────────────────────┐     └──────────────────┘│
│  │ What this question would do:          │                        │
│  │ <description>                         │  [PDF link] [Bill link]│
│  └──────────────────────────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘

┌───────────────┬──────────────────────────────────────────────────┐
│  Overview ●   │  Overview                                        │
│               │  The ballot question at a high-level             │
│  Testimonies  │                                                  │
│           42  │  Key Details                                     │
│               │  ┌──────────────────────────────┐               │
│  Synthesis &  │  │ At a glance:                  │               │
│  Insights     │  │ • Who: ...                    │               │
│               │  │ • How: ...                    │               │
│  For &        │  └──────────────────────────────┘               │
│  Against      │                                                  │
│               │  Final Summary ⓘ                                 │
│  News &       │  <full summary text>                             │
│  Media    20  │                                                  │
│               │  Committee Hearing                               │
│  Academia  20 │  <hearing explainer copy>                        │
│               │  • Status: Occurred / Scheduled                  │
│  Campaign     │  • Date: [date]                                  │
│  Financials   │                                                  │
│               │  Watch the committee hearing here. [link]        │
│  Map          │                                                  │
└───────────────┴──────────────────────────────────────────────────┘
```

---

## Data model

The voter-facing fields are already in `functions/src/ballotQuestions/types.ts`:

```typescript
interface BallotQuestion {
  // ... existing fields ...
  description: string | null      // "What this question would do" — header card + DescriptionBox
  atAGlance: { label: string; value: string }[] | null  // Key Details bullet list in Overview
  fullSummary: string | null      // Final Summary section in Overview
  pdfUrl: string | null           // Link to the initiative petition PDF
}
```

`billId` (already in the schema) provides the bill link in the header. `pdfUrl` is manually set in the YAML file for each petition. All four fields are nullable — render their sections only when the value is non-null.

---

## `getServerSideProps`

```typescript
const ballotQuestion = await dbService().getBallotQuestion({ id })
if (!ballotQuestion) return { notFound: true }

// billId can be null (pre-legislature); hide bill link and hearing section when null
const bill = ballotQuestion.billId
  ? await dbService().getBill({
      court: ballotQuestion.court,
      billId: ballotQuestion.billId,
    })
  : null

// Fetch hearing documents for the Overview tab.
// bill.hearingIds contains eventId strings; documents are at /events/hearing-{eventId}.
// SJ42 petitions typically have 0–1 hearings so fetching all is cheap.
const hearings = bill?.hearingIds?.length
  ? await Promise.all(
      bill.hearingIds.map(id =>
        dbService().getDocData<Hearing>("events", `hearing-${id}`)
      )
    ).then(results => results.filter(Boolean))
  : []

return {
  props: { ballotQuestion, bill, hearings },
  headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" },
}
```

Cache is shorter than bills because `ballotStatus` changes during election season.

---

## Header card

The header always shows:

- Back link ("Return to ballot questions")
- Follow button
- Question number + short name (from `ballotQuestion.id` + type label)
- Full title (from `bill.Title`, or a standalone title field if `billId` is null)
- "What this question would do" description box (`ballotQuestion.description`)
- **Your Testimony** panel (right side) — see testimony routing below
- PDF link (`ballotQuestion.pdfUrl`) — open in new tab; hidden if null
- Bill link — `/bills/{court}/{billId}` — hidden if `billId` is null

---

## Testimony routing by status

The **Your Testimony** panel lives in the header card, not inside a tab. It is always visible.

| `ballotStatus` | Your Testimony panel | Testimonies tab feed |
|---|---|---|
| `legislature` | "Testify on the bill →" link (no form here) | Ballot feed (`ballotQuestionId`). This will typically be empty / count `0` because ballot-question testimony is not yet accepted. |
| `qualifying` | **Active** form (`ballotQuestionId` set) | Ballot feed (`ballotQuestionId`) |
| `certified` | **Active** form (`ballotQuestionId` set) | Ballot feed (`ballotQuestionId`) |
| `ballot` | **Active** form (`ballotQuestionId` set) | Ballot feed (`ballotQuestionId`) |
| `enacted` / `failed` / `withdrawn` | No form. Read-only notice. | Ballot feed read-only |

Active `ballotQuestionId` testimony phases: `qualifying | certified | ballot`.

During `legislature`, the ballot question page should not embed bill testimony. It should still show ballot-question testimony counts/feed, which will normally be empty because electorate testimony is not yet available. If the user wants to read legislative testimony, they should click through to the corresponding bill page.

---

## Overview tab

Three sections, in order:

### 1. Key Details

Renders `ballotQuestion.atAGlance` as a list of `label: value` pairs inside a card. This is manually curated in the YAML file.

### 2. Final Summary

Renders `ballotQuestion.fullSummary` as body text. Manually curated.

### 3. Committee Hearing

Reads from `hearings` (fetched server-side from `bill.hearingIds`). If no hearings exist, this section is hidden.

For each relevant hearing, display:
- **Status**: "Occurred" if `hearing.content.startsAt` is in the past, "Scheduled" if in the future
- **Date**: formatted from `hearing.content.startsAt`
- **Watch link**: "Watch the committee hearing here." linked to `hearing.videoURL` — hidden if no video

Since ballot questions are always under SJ42 and typically have one hearing, render a single hearing block. If there are multiple, render them in reverse chronological order (most recent first).

**Hearing data model recap:**
- `bill.hearingIds?: string[]` — event IDs; doc path is `/events/hearing-{id}`
- `bill.nextHearingAt?: Timestamp` — convenience field for upcoming hearing only (not sufficient alone — we need date + videoURL from the full document)
- `hearing.videoURL?: string` — link for the "Watch" CTA
- `hearing.content.startsAt` — determines "Occurred" vs. "Scheduled" status

No new components are needed for hearing display — build a simple `CommitteeHearing` component local to `components/ballotquestions/`.

---

## Component reuse map

| Component | File | Used where | Props |
|---|---|---|---|
| `ViewTestimony` / `TestimonyItem` | various | Testimonies tab | unchanged |

`SponsorsAndCommittees` is **not** reused here. The hearing display in Overview is custom (`CommitteeHearing`) because the Figma shows a richer layout (status badge, explanatory copy, video link) than what `SponsorsAndCommittees` renders.

---

## New files

```
pages/
  ballotQuestions/
    [id].tsx                      ← page entry point + getServerSideProps

components/
  ballotquestions/
    BallotQuestionDetails.tsx     ← top-level layout, receives { ballotQuestion, bill, hearings }
    BallotQuestionHeader.tsx      ← header card: title, description box, testimony panel, PDF/bill links
    BallotQuestionNav.tsx         ← vertical left nav (Overview, Testimonies, + placeholder items)
    DescriptionBox.tsx            ← "What this question would do" card
    OverviewTab.tsx               ← Key Details + Final Summary + CommitteeHearing
    CommitteeHearing.tsx          ← hearing status, date, and watch link
    TestimoniesTab.tsx            ← testimony feed, wired to usePublishedTestimonyListing
    YourTestimonyPanel.tsx        ← header-right testimony CTA, status-conditional (see routing table)
```

---

## Existing files that need changes

### `components/publish/panel/TestimonyFormPanel.tsx`

Add an optional `ballotQuestionId` prop. When present, persist it into the draft write at `DraftTestimony.ballotQuestionId`.

```typescript
// YourTestimonyPanel — active ballot question phases
<TestimonyFormPanel bill={bill} ballotQuestionId={ballotQuestion.id} />

// legislature phase — links to bill page instead, no form rendered here
```

### `functions/src/testimony/publishTestimony.ts`

Two changes required in `PublishTestimonyTransaction`:

**1. Validate `ballotQuestionId` in `resolveDraft()`**

After the existing bill existence check (lines 175–183), add a parallel check for ballot question. `ballotQuestionId` is user-supplied and must be validated at publish time, same as `billId`:

```typescript
if (draft.ballotQuestionId) {
  const bqSnap = await db.doc(`/ballotQuestions/${draft.ballotQuestionId}`).get()
  if (!bqSnap.exists) {
    throw fail(
      "failed-precondition",
      `Draft testimony has invalid ballot question ID ${draft.ballotQuestionId}`
    )
  }
}
```

**2. Propagate `ballotQuestionId` into `newPublication` in `run()`**

The field is on `BaseTestimony` (which both `DraftTestimony` and `Testimony` extend) but is not currently copied from draft to publication. Add it to the `newPublication` object:

```typescript
const newPublication: Testimony = {
  // ... existing fields ...
  ballotQuestionId: this.draft.ballotQuestionId ?? null,
}
```

### `components/bill/BillTestimonies.tsx`

Generalize to accept either `{ bill: Bill }` or `{ ballotQuestionId: string }` so the Testimonies tab can use it with a ballot question filter. Consider renaming to `Testimonies` (the bill-specific name is an accident of where it was first used).

### `components/db/testimony/usePublishedTestimonyListing.ts`

Add `ballotQuestionId` to `Refinement` and `getWhere()` (~5 lines). The Firestore index is already deployed. Change is purely additive — no existing call sites affected.

```typescript
// Refinement addition
ballotQuestionId?: string

// getWhere addition
if (ballotQuestionId)
  constraints.push(["ballotQuestionId", "==", ballotQuestionId])
```

---

## What does NOT change

- Testimony Firestore paths or collection structure
- `testimonyCount` / position counts on `Bill` documents
- How `TestimonyFormPanel` triggers the cloud function (draft ID passed to `publishTestimony` callable — no change to that invocation)
- `ViewTestimony` renderer, `TestimonyItem` — reused as-is
- All existing bill pages and their testimony behavior
- Hearing sync — no changes to `/events` collection or ingestion
