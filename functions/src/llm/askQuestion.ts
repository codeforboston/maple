import * as functions from "firebase-functions"
import { z } from "zod"
import { checkRequestZod } from "../common"
import { askAgent } from "./agent"
import { assertWithinBudget, recordUsage } from "./usage"
import { LLM_CONFIG } from "./config"

const Request = z.object({
  question: z.string().min(1).max(2000)
})

/**
 * Callable function for the bill/policy Q&A chat widget. Auth state comes
 * from the verified `context.auth` (never from client-supplied fields), so
 * anonymous vs logged-in cost limits can't be spoofed.
 */
export const askQuestion = functions
  .runWith({ secrets: ["OPENAI_API_KEY"], timeoutSeconds: 120, memory: "512MB" })
  .https.onCall(async (data, context) => {
    const { question } = checkRequestZod(Request, data)
    const uid = context.auth?.uid

    if (uid) {
      await assertWithinBudget(uid)
    }

    const { answer, tokensUsed } = await askAgent(question, {
      recursionLimit: uid
        ? LLM_CONFIG.recursionLimit
        : LLM_CONFIG.anonymousRecursionLimit,
      maxOutputTokens: uid
        ? LLM_CONFIG.maxOutputTokens
        : LLM_CONFIG.anonymousMaxOutputTokens
    })

    if (uid) {
      await recordUsage(uid, tokensUsed)
    }

    return {
      answer,
      usage: {
        tokensUsed,
        isLoggedIn: Boolean(uid)
      }
    }
  })
