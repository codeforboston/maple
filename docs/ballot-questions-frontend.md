# Ballot Questions — Frontend Architecture

## Overview

This document describes how to build the ballot question detail page (`/ballotQuestions/[id]`). The backend is complete (Firestore collection, security rules, indexes, types, sync script). This page follows the same patterns as the bill detail page.

---

## Query flow (`getServerSideProps`)

Two fetches are required:

```ts
const ballotQuestion = await dbService().getBallotQuestion({ id })
if (!ballotQuestion) return { notFound: true }

const bill = await dbService().getBill({
  court: ballotQuestion.court,
  billId: ballotQuestion.billId,
})
if (!bill) return { notFound: true }

return {
  props: { ballotQuestion, bill },
  headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" },
}
```

### Why fetch the bill too?

The existing testimony components (`BillTestimonies`, `TestimonyCounts`, `TestimonyFormPanel`) all accept `{ bill: Bill }` and rely on `bill.id`, `bill.court`, and the count fields (`testimonyCount`, `endorseCount`, `neutralCount`, `opposeCount`). None of these fields exist on `BallotQuestion`. Fetching the bill server-side lets us pass it to these components unchanged.

Testimony is user-generated and updates frequently — the components handle client-side reactive fetching internally via `usePublishedTestimonyListing`. No extra hooks are needed in the page.

### Cache

`s-maxage=60, stale-while-revalidate=300` — shorter than bills because ballot question status (`ballotStatus`) changes during election season.

---

## Reusable components (no changes needed)

| Component | File | Props | Purpose |
|---|---|---|---|
| `BillTestimonies` | `components/bill/BillTestimonies.tsx` | `{ bill: Bill }` | Testimony list |
| `TestimonyCounts` | `components/bill/TestimonyCounts.tsx` | `{ bill: Bill }` | Endorse / neutral / oppose counts |
| `TestimonyFormPanel` | `components/publish/panel/TestimonyFormPanel.tsx` | `{ bill: Bill }` | "Your Testimony" sidebar widget |

Pass `bill` (fetched server-side) directly to all three.

---

## What needs to be built

### Ballot question header
- "Question N" heading (from `ballotQuestionNumber`, or "Question" if null)
- Type badge (human-readable label for `type`: `initiative_statute` → "Initiative — Statute", etc.)
- Status chip (human-readable label for `ballotStatus`: `legislature` → "In Legislature", `ballot` → "On Ballot", etc.)
- Election year

### Description box
A styled card containing the ballot question's description text. The `BallotQuestion` type currently does not include a `description` field — confirm with the data model whether this will be added, or whether the linked bill's title/description should be used as a fallback.

### Left sidebar nav
Tabs/sections (only "Testimonies" is live initially; others render as placeholder stubs):
- Overview
- Testimonies ← live
- For & Against
- (additional sections TBD)

### `BallotQuestionDetails` component
Top-level component that wires everything together and receives `{ ballotQuestion, bill }` as props.

---

## Page layout

Two-column Bootstrap grid, matching the bill page:

```
+------------------------------------+  +------------------+
|  Ballot question header            |  |                  |
|  Description box                   |  | TestimonyForm    |
|  Sidebar nav                       |  | Panel            |
|  <BillTestimonies bill={bill} />   |  | (bill={bill})    |
+------------------------------------+  +------------------+
         col md=8                              col md=4
```

```tsx
<Row>
  <Col md={8}>
    <BallotQuestionHeader ballotQuestion={ballotQuestion} />
    <DescriptionBox ballotQuestion={ballotQuestion} />
    <SidebarNav />
    <BillTestimonies bill={bill} />
  </Col>
  <Col md={4}>
    <TestimonyFormPanel bill={bill} />
  </Col>
</Row>
```

---

## File structure (suggested)

```
pages/
  ballotQuestions/
    [id].tsx                  ← page entry point + getServerSideProps

components/
  ballotquestions/
    BallotQuestionDetails.tsx ← top-level layout component
    BallotQuestionHeader.tsx  ← header: number, type badge, status, year
    DescriptionBox.tsx        ← "What this question would do" card
    SidebarNav.tsx            ← tab nav (Testimonies live; others stub)
```
