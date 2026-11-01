# Cosign feature requirements

## Context

MAPLE provides users with the ability to submit testimony on bills.

We want to add a feature that allows a user to "cosign" someone else's
testimony, adding a +1 to what the other is saying, and an optional note
explaining why they are cosigning. The total number of cosigns is to appear
next to the testimony. This will be initially rolled out to conference
committee testimonies only.

## 1. Purpose

The user must be able to press a button to cosign testimony for a conference committee, and see that cosignature reflected.

## 2. Triggers

What triggers the feature?

| ID   | Trigger Type                 | Source          | Resulting action |
| ---- | ---------------------------- | --------------- | ---------------- |
| TR-1 | Pressing the "cosign" button | User on Web UI  | FR-1, FR-5       |
| TR-2 | Pressing the edit button     | User on Web UI  | FR-3             |
| TR-3 | Deleting parent testimony    | Admin on Web UI | FR-4             |

## 3. Functional Requirements

| ID   | Requirement                                                                                | Trigger | Acceptance criterion                                                                                                                                                                                                             | Priority |
| ---- | ------------------------------------------------------------------------------------------ | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| FR-1 | The cosign panel pops up and allows the user to cosign testimony                           | TR-1    | The testimony card that's been cosigned gains a "Cosigned" count, a number of districts, a last cosigned date, and the new testimony grouped under it (noteless cosigns appear only if "show cosigns without content" is ticked) | Must     |
| FR-2 | Cosigned testimony appears in newsletters and the newsfeed                                 | FR-1    | A new piece of cosigning testimony is included in the email update to followers of the conference or the cosigner                                                                                                                | Must     |
| FR-3 | An "edit cosign" view appears allowing the user to change the statement (and nothing else) | TR-2    | A piece of cosigned testimony has its justification sentence edited; it's not possible to change its position or to turn it into a plain testimony                                                                               | Must     |
| FR-4 | Deleting the parent testimony cascades to deleting cosigns                                 | TR-3    | Deleting parent testimony deletes cosigns of it                                                                                                                                                                                  | Must     |
| FR-5 | A logged out user that presses cosign is taken to the login flow                           | TR-1    | It's possible to initiate login by pressing cosign                                                                                                                                                                               | Must     |
| FR-6 | Cosigned testimony copies the parent's position, and the position is not editable          | FR-1    | Editing a parent's position does not edit the cosign's, and the tally reflects this                                                                                                                                              | Must     |
| FR-7 | Cosigning a cosign or your own testimony is an error                                       | FR-1    | There is no cosign button on co-signatures, or on the logged in user's testimony, and calling the server-side to do an invalid cosign fails                                                                                      | Must     |
| FR-8 | The conference shows a bar with its position totals, cosigns included                      | FR-1    | On submitting a cosign, the conference's position tallies change                                                                                                                                                                 | Must     |

## 4. Platform Constraints

| ID   | Constraint area | Requirement                                                                                                           |
| ---- | --------------- | --------------------------------------------------------------------------------------------------------------------- |
| PC-1 | Infrastructure  | Firestore data must be denormalized and querying can only happen through a set of indexes that may need to be updated |
| PC-2 | Infrastructure  | Any server-side actions must be implemented as a cloud-function with clear triggers                                   |

## 5. Non-Functional Requirements

| ID    | Category       | Requirement                                                                                                               | Target |
| ----- | -------------- | ------------------------------------------------------------------------------------------------------------------------- | ------ |
| NFR-1 | Data integrity | No migration of existing records                                                                                          | N/A    |
| NFR-2 | Consistency    | Cosigns behave like other testimony vis-a-vis sharing and restrictions for posting (e.g. "only while conference is open") | N/A    |

## 6. Failure Behaviour

| ID   | Failure condition            | Expected behaviour             | Retry/backoff | Alert? |
| ---- | ---------------------------- | ------------------------------ | ------------- | ------ |
| FB-1 | Parent deleted mid-cosign    | Cosign fails, user is told     | N/A           | No     |
| FB-2 | Conference closes mid-cosign | Cosign fails, user is told     | N/A           | No     |
| FB-3 | Double submission            | Exactly one cosign is recorded | N/A           | No     |

## 7. Open Questions

| ID  | Question | Status | Resolution |
| --- | -------- | ------ | ---------- |

## 8. Out of Scope

| ID    | Category       | Anti-Requirement                                                      | Target |
| ----- | -------------- | --------------------------------------------------------------------- | ------ |
| OOS-1 | Functional     | No cosigns in non-conference bills                                    | N/A    |
| OOS-2 | Functional     | No sending cosigns as a digest to the org whose testimony is cosigned | N/A    |
| OOS-3 | Functional     | No private notes for orgs                                             | N/A    |
| OOS-4 | Infrastructure | No ATProto scope whatsoever                                           | N/A    |

## Change Log

| Version | Date       | Change        |
| ------- | ---------- | ------------- |
| 0.1     | 2026-10-22 | Initial draft |
