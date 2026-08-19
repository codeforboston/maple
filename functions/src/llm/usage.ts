import { db, FieldValue } from "../firebase"
import { fail } from "../common"
import { LLM_CONFIG } from "./config"

function currentPeriod(): string {
  const now = new Date()
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`
}

function usageDocId(uid: string): string {
  return `${uid}_${currentPeriod()}`
}

/**
 * Throws if a logged-in user has exhausted their monthly token budget.
 * Stored in a top-level `llmUsage` collection (not under `users/{uid}/...`)
 * because the existing rule `users/{userId}/{document=**}` grants the owner
 * client-side write access, which would let a client reset its own counter.
 */
export async function assertWithinBudget(uid: string): Promise<void> {
  const doc = await db.collection("llmUsage").doc(usageDocId(uid)).get()
  const tokensUsed = doc.data()?.tokensUsed ?? 0

  if (tokensUsed >= LLM_CONFIG.loggedInMonthlyTokenBudget) {
    throw fail(
      "resource-exhausted",
      `Monthly usage limit reached (${LLM_CONFIG.loggedInMonthlyTokenBudget} tokens). Limit resets next month.`
    )
  }
}

export async function recordUsage(uid: string, tokensUsed: number): Promise<void> {
  await db
    .collection("llmUsage")
    .doc(usageDocId(uid))
    .set(
      {
        uid,
        period: currentPeriod(),
        tokensUsed: FieldValue.increment(tokensUsed),
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    )
}
