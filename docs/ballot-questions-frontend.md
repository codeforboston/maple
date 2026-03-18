# Ballot Questions — Frontend Architecture

## Overview

This document describes how to build the ballot question detail page (`/ballotQuestions/[id]`). The backend is complete (Firestore collection, security rules, indexes, types, sync script, db query methods). This document covers the UX architecture, data flow, component reuse map, and the UI changes needed when the page is built.

---

## Page: `/ballotQuestions/[id]`

The page has two tabs: a voter-facing **Ballot Question** tab and a legislative-record **Bill & Legislature** tab.

```
┌─────────────────────────────────────────────────────┐
│  Header: "Question 3 · Initiative — Statute · 2026" │
│  Status banner (see below)                           │
├──────────────────────────────────────────────────────┤
│  [Ballot Question]  [Bill & Legislature]             │
├──────────────────────────────────────────────────────┤
│                                                      │
│  TAB 1: Ballot Question (voter-facing)               │
│  ─ Description / what this would do                  │
│  ─ Testimony form OR CTA based on ballotStatus       │
│  ─ Ballot testimony feed (ballotQuestionId filter)   │
│                                                      │
│  TAB 2: Bill & Legislature                           │
│  ─ Bill number, title, summary                       │
│  ─ Hearing schedule                                  │
│  ─ Sponsors / committees                             │
│  ─ Bill testimony form (when legislature only)       │
│  ─ Bill testimony feed (billId/court filter)         │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## `getServerSideProps`

```typescript
const ballotQuestion = await dbService().getBallotQuestion({ id })
if (!ballotQuestion) return { notFound: true }

// billId can be null (pre-legislature scope); hide bill tab when undefined
const bill = ballotQuestion.billId
  ? await dbService().getBill({
      court: ballotQuestion.court,
      billId: ballotQuestion.billId,
    })
  : undefined

return {
  props: { ballotQuestion, bill: bill ?? null },
  headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" },
}
```

Cache is shorter than bills because `ballotStatus` changes during election season.

---

## Status banners (voter education)

Each `ballotStatus` gets a distinct banner explaining the process, not just the state. The banner drives what CTA appears in Tab 1.

| `ballotStatus` | Banner message | Tab 1 CTA |
|---|---|---|
| `legislature` | "Before the Legislature — legislators can enact or reject this directly. Add your voice to the legislative record." | Link to bill tab testimony form |
| `qualifying` | "Gathering Signatures — petitioners need ~50k certified signatures for this to reach the ballot. Tell people whether they should sign." | Active testimony form (`ballotQuestionId` set) |
| `certified` | "Certified for [year] Ballot — the Secretary of State has certified this as Question [N]." | Active testimony form (`ballotQuestionId` set) |
| `ballot` | "On the Ballot — voting is underway in the [year] election." | Active testimony form (`ballotQuestionId` set) |
| `enacted` | "Enacted — this passed." | None (read-only) |
| `failed` | "Did not pass." | None (read-only) |
| `withdrawn` | "Withdrawn by petitioners." | None (read-only) |

---

## Testimony routing by status

| `ballotStatus` | Tab 1 (Ballot Question) | Tab 2 (Bill & Legislature) |
|---|---|---|
| `legislature` | No form. "Testify on the bill →" link. Ballot feed empty. | **Active** form + bill testimony feed |
| `qualifying` | **Active** form (`ballotQuestionId` set) + ballot feed | Bill feed read-only, no form |
| `certified` | **Active** form (`ballotQuestionId` set) + ballot feed | Bill feed read-only, no form |
| `ballot` | **Active** form (`ballotQuestionId` set) + ballot feed | Bill feed read-only, no form |
| `enacted` / `failed` / `withdrawn` | No form. Ballot feed read-only. | Bill feed read-only, no form |

Active `ballotQuestionId` testimony phases: `qualifying | certified | ballot`.

---

## Component reuse map

These components are used unchanged — just pass `bill` (fetched server-side) or `ballotQuestionId` as props:

| Component | File | Used in | Props |
|---|---|---|---|
| `TestimonyCounts` | `components/bill/TestimonyCounts.tsx` | Tab 2 | `{ bill: Bill }` |
| `ViewTestimony` / `TestimonyItem` | various | Both tabs | unchanged — reused as-is in both feeds |

---

## Data flow: two parallel testimony feeds

The page runs two independent testimony queries simultaneously:

- **Ballot testimony feed** (Tab 1): filtered by `ballotQuestionId`
- **Bill testimony feed** (Tab 2): filtered by `billId` + `court`

Both use the same `usePublishedTestimonyListing` hook — different parameters, different Firestore queries, same renderer. The Firestore index on `ballotQuestionId` is already deployed.

---

## UI files that need changes when the page is built

### New files

```
pages/
  ballotQuestions/
    [id].tsx                    ← page entry point + getServerSideProps

components/
  ballotquestions/
    BallotQuestionDetails.tsx   ← top-level layout, receives { ballotQuestion, bill }
    BallotQuestionHeader.tsx    ← "Question N · type badge · year" heading
    StatusBanner.tsx            ← status-conditional banner + CTA (see table above)
    BallotQuestionTabs.tsx      ← tab switcher (Tab 1 / Tab 2)
    DescriptionBox.tsx          ← "What this question would do" card
```

### `components/publish/panel/TestimonyFormPanel.tsx`

Add an optional `ballotQuestionId` prop. When present, persist it into the draft write at `DraftTestimony.ballotQuestionId`. The publish cloud function picks it up from the draft — no server-side changes needed since `BaseTestimony` already has the field.

```typescript
// Tab 1 (ballot question tab) — ballotQuestionId active phases only
<TestimonyFormPanel bill={bill} ballotQuestionId={ballotQuestion.id} />

// Tab 2 (bill tab) — legislature phase only
<TestimonyFormPanel bill={bill} />
```

Internally the form just needs to write `ballotQuestionId` into the draft. The draft type (`DraftTestimony extends BaseTestimony`) already has the field.

### `components/bill/BillTestimonies.tsx`

`BillTestimonies` is a thin wrapper around `usePublishedTestimonyListing` + `ViewTestimony`. Generalize it to accept either `{ bill: Bill }` or `{ ballotQuestionId: string }` so both tabs can use the same component with different queries. Consider renaming to `Testimonies` (the bill-specific name is an accident of where it was first used).

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
- `TestimonyFormPanel` internal publish flow (draft → cloud function)
- `ViewTestimony` renderer, `TestimonyItem` — reused as-is in both tabs
- All existing bill pages and their testimony behavior
