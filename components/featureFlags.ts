import { z } from "zod"
import { check } from "./utils"

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

const values = check(defaults[process.env.NODE_ENV])

// Add a function call of indirection to allow reloading values
export const flags = () => values
