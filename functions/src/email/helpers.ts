export function isDefined(v: unknown) {
  return v !== undefined
}

export function toLowerCase(aString: string) {
  return aString.toLowerCase()
}

export function noUpdatesFormat(aString: string) {
  let result = ""
  switch (aString) {
    case "Monthly":
      result = "this month"
      break
    case "Weekly":
      result = "this week"
      break
    default:
      result = "today"
  }
  return result
}
