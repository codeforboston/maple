export function isDefined(v: unknown) {
  return v !== undefined
}

export function toLowerCase(aString: string) {
  return aString.toLowerCase()
}

export function noUpdatesFormat(aString: string) {
  switch (aString) {
    case "Monthly":
      return "this month"
      break
    case "Weekly":
      return "this week"
      break
    default:
      return "today"
  }
}
