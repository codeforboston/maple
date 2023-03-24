import { z } from "zod"

export const FeatureFlags = z.object({
  /** Testimony diffing in the detail page */
  testimonyDiffing: z.boolean().default(false),
  /** Notifications and follows */
  notifications: z.boolean().default(false),
  /** Bill Tracker on Bill Details */
  billTracker: z.boolean().default(false)
})

export type FeatureFlags = z.infer<typeof FeatureFlags>

const Env = z.union([
  z.literal("development"),
  z.literal("test"),
  z.literal("production")
])
type Env = z.infer<typeof Env>

const defaults: Record<Env, FeatureFlags> = {
  development: {
    testimonyDiffing: false,
    notifications: true,
    billTracker: true
  },
  production: {
    testimonyDiffing: false,
    notifications: false,
    billTracker: false
  },
  test: {
    testimonyDiffing: false,
    notifications: false,
    billTracker: false
  }
}

const envName = Env.parse(
  process.env.NEXT_PUBLIC_ENV_NAME ?? process.env.NODE_ENV
)
const values = FeatureFlags.parse(defaults[envName])

// Add a function call of indirection to allow reloading values in the future
export const flags = () => values
