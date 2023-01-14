import { z } from "zod"

export const FeatureFlags = z.object({
  testimonyDiffing: z.boolean().default(false)
})
export type FeatureFlags = z.infer<typeof FeatureFlags>

const defaults: Record<typeof process.env.NODE_ENV, FeatureFlags> = {
  development: {
    testimonyDiffing: false
  },
  production: {
    testimonyDiffing: false
  },
  test: {
    testimonyDiffing: false
  }
}

const values = FeatureFlags.parse(defaults[process.env.NODE_ENV])

// Add a function call of indirection to allow reloading values in the future
export const flags = () => values
