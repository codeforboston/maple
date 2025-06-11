export function addCounts() {
  let sum = 0
  for (let i = 0; i < arguments.length - 1; i++) {
    sum += parseFloat(arguments[i]) || 0 // Convert to number and handle NaN
  }
  return sum
}

export function ifGreaterThan(
  this: any,
  value: number,
  comparisonValue: number,
  options: any
) {
  if (value > comparisonValue) {
    return options.fn(this) // Render the block if true
  }
  return options.inverse(this)
}

export function isDefined(v: unknown) {
  return v !== undefined
}

export function formatDate(timestamp: Date) {
  const date = new Date(timestamp)

  return date.toLocaleDateString()
}

export function minusFour(value: number) {
  const result = value - 4
  return result
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

export function toLowerCase(aString: unknown) {
  if (typeof aString === "string") {
    console.log(`Attempting to convert to lowercase: ${aString}`)
    return aString.toLowerCase()
  }
  console.error(`toLowerCase received a non-string value: ${aString}`)
  return undefined
}
