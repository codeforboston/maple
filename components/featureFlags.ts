import { z } from "zod"

export const FeatureFlags = z.object({
  /** Testimony diffing in the detail page */
  testimonyDiffing: z.boolean().default(false),
  /** Notifications and follows */
  notifications: z.boolean().default(false)
})

export type FeatureFlags = z.infer<typeof FeatureFlags>

const defaults: Record<typeof process.env.NODE_ENV, FeatureFlags> = {
  development: {
    testimonyDiffing: false,
    notifications: false
  },
  production: {
    testimonyDiffing: false,
    notifications: false
  },
  test: {
    testimonyDiffing: false,
    notifications: false
  }
}

const values = FeatureFlags.parse(defaults[process.env.NODE_ENV])

// Add a function call of indirection to allow reloading values in the future
export const flags = () => values
