import { isAfter, subDays } from "date-fns"

export const withinCutoff = (date: Date) => {
  const now = new Date()
  const cutoff = subDays(now, 8)

  return isAfter(date, cutoff) && !isAfter(date, now)
}
