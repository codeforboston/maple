import { Request, Response, NextFunction } from "express"

const WINDOW_MS = 60_000 // 1 minute
const MAX_PER_MINUTE = 60
const MAX_PER_DAY = 1_000

interface TokenBucket {
  minuteCount: number
  minuteWindowStart: number
  dayCount: number
  dayStart: number
}

const buckets = new Map<string, TokenBucket>()

function getBucket(token: string): TokenBucket {
  const now = Date.now()
  let bucket = buckets.get(token)

  if (!bucket) {
    bucket = {
      minuteCount: 0,
      minuteWindowStart: now,
      dayCount: 0,
      dayStart: now
    }
    buckets.set(token, bucket)
    return bucket
  }

  // Reset minute window if expired
  if (now - bucket.minuteWindowStart >= WINDOW_MS) {
    bucket.minuteCount = 0
    bucket.minuteWindowStart = now
  }

  // Reset daily count if a new UTC day has started
  const bucketDay = new Date(bucket.dayStart).toISOString().slice(0, 10)
  const today = new Date(now).toISOString().slice(0, 10)
  if (bucketDay !== today) {
    bucket.dayCount = 0
    bucket.dayStart = now
  }

  return bucket
}

/** Extract the bearer token or agent key that was validated by auth middleware. */
function getTokenKey(req: Request): string {
  // Use the agent key doc ID if present, else the Firebase UID
  const agent = (req as any).agent
  const user = (req as any).user
  if (agent?.id) return `agent:${agent.id}`
  if (user?.uid) return `user:${user.uid}`
  // Fallback: raw Authorization header value (already validated upstream)
  const auth = req.headers.authorization ?? ""
  return `raw:${auth.slice(0, 64)}`
}

export function rateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const key = getTokenKey(req)
  const bucket = getBucket(key)

  if (bucket.dayCount >= MAX_PER_DAY) {
    return res.status(429).json({
      error: "Daily request limit reached",
      detail: `Maximum ${MAX_PER_DAY} requests per day per token.`
    })
  }

  if (bucket.minuteCount >= MAX_PER_MINUTE) {
    return res.status(429).json({
      error: "Rate limit exceeded",
      detail: `Maximum ${MAX_PER_MINUTE} requests per minute per token.`
    })
  }

  bucket.minuteCount++
  bucket.dayCount++
  next()
}
