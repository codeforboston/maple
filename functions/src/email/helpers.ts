export function isDefined(v: unknown) {
  return v !== undefined
}

export function toLowerCase(aString: unknown) {
  if (typeof aString === "string") {
    console.log(`Attempting to convert to lowercase: ${aString}`)
    return aString.toLowerCase()
  }
  console.error(`toLowerCase received a non-string value: ${aString}`)
  return undefined
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
