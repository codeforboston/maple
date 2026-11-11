const GENERATIONAL_SUFFIXES = new Set(["jr", "sr", "ii", "iii", "iv", "v"])

/** A member name as the legislature writes it: "Bradley H. Jones, Jr." is
 * first "Bradley", surname "Jones", suffix "Jr.". */
export function splitMemberName(fullName: string) {
  const parts = fullName.replace(/,/g, "").trim().split(/\s+/)
  const suffixes: string[] = []
  while (
    parts.length > 1 &&
    GENERATIONAL_SUFFIXES.has(
      parts[parts.length - 1].toLowerCase().replace(/\./g, "")
    )
  )
    suffixes.unshift(parts.pop()!)
  return {
    first: parts.length > 1 ? parts[0] : "",
    surname: parts[parts.length - 1].replace(/\.$/, ""),
    suffix: suffixes.join(" ")
  }
}

export const extractLastName = (fullName: string) =>
  splitMemberName(fullName).surname
