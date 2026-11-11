import { z } from "zod"

/** Thrown for invalid script arguments; the runner prints it without a stack trace. */
export class ArgsError extends Error {
  constructor(readonly issues: z.ZodIssue[]) {
    super(
      "Invalid arguments:\n" +
        issues
          .map(({ path: [arg, ...rest], message }) => {
            // show 1-based positions, e.g. the 2nd value in --courts 193,abc
            const item = rest.map(p => (typeof p === "number" ? p + 1 : p))
            const where = item.length ? ` (item ${item.join(".")})` : ""
            return `  --${arg ?? "?"}${where}: ${message}`
          })
          .join("\n")
    )
    this.name = "ArgsError"
  }
}

/** A comma-separated list of general court numbers, e.g. --courts 192,193 */
export const courtList = z
  // yargs parses a single value like "193" as a number
  .union([z.string(), z.number()])
  .transform(v => String(v).split(","))
  .pipe(
    z.array(
      z
        .string()
        .trim()
        .min(1, "empty value, check for a stray comma")
        .pipe(z.coerce.number().int().positive())
    )
  )

export function parseArgs<T extends z.ZodTypeAny>(
  schema: T,
  args: unknown
): z.output<T> {
  const result = schema.safeParse(args)
  if (!result.success) throw new ArgsError(result.error.issues)
  return result.data
}
