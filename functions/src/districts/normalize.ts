const ordinalWords: Record<string, number> = {
  first: 1,
  second: 2,
  third: 3,
  fourth: 4,
  fifth: 5,
  sixth: 6,
  seventh: 7,
  eighth: 8,
  ninth: 9,
  tenth: 10,
  eleventh: 11,
  twelfth: 12,
  thirteenth: 13,
  fourteenth: 14,
  fifteenth: 15,
  sixteenth: 16,
  seventeenth: 17,
  eighteenth: 18,
  nineteenth: 19
}

const tensOrdinalWords: Record<string, number> = {
  twentieth: 20,
  thirtieth: 30
}

const tensWords: Record<string, number> = {
  twenty: 20,
  thirty: 30
}

const ordinalSuffix = /^(\d+)(st|nd|rd|th)?$/i

function parseOrdinalToken(word: string) {
  const numericOrdinal = word.match(ordinalSuffix)
  if (numericOrdinal) return Number(numericOrdinal[1])

  return ordinalWords[word] ?? tensOrdinalWords[word]
}

function normalizeLeadingOrdinal(words: string[]) {
  const [firstWord, secondWord] = words

  if (!firstWord) return words

  const ordinal = parseOrdinalToken(firstWord)
  if (ordinal) return [String(ordinal), ...words.slice(1)]

  const tens = tensWords[firstWord]
  const ones = secondWord ? ordinalWords[secondWord] : undefined
  if (tens && ones) return [String(tens + ones), ...words.slice(2)]

  return words
}

export function normalizeDistrictName(district: string) {
  const words = district
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[-–—]/g, " ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\band\b/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)

  return normalizeLeadingOrdinal(words).join(" ")
}

export function districtId(branch: "House" | "Senate", district: string) {
  return `${branch.toLowerCase()}-${normalizeDistrictName(district).replace(
    /\s+/g,
    "-"
  )}`
}

const ordinalSuffixes = ["th", "st", "nd", "rd"]

function formatOrdinal(number: number) {
  const suffix =
    number % 100 >= 11 && number % 100 <= 13
      ? "th"
      : ordinalSuffixes[number % 10] ?? "th"

  return `${number}${suffix}`
}

export function displayDistrictName(sourceDistrict: string) {
  const words = sourceDistrict.split(/\s+/)
  const firstParts = (words[0] ?? "").toLowerCase().split(/[-–—]/)

  if (firstParts.length === 2) {
    const normalized = normalizeLeadingOrdinal(firstParts)
    if (normalized.length === 1 && /^\d+$/.test(normalized[0])) {
      return [formatOrdinal(Number(normalized[0])), ...words.slice(1)].join(" ")
    }
  }

  const firstOrdinal = parseOrdinalToken(
    (words[0] ?? "").toLowerCase().replace(/[^\w]/g, "")
  )
  if (firstOrdinal) {
    return [formatOrdinal(firstOrdinal), ...words.slice(1)].join(" ")
  }

  const secondOrdinal = (words[1] ?? "").toLowerCase().replace(/[^\w]/g, "")
  const tens = tensWords[(words[0] ?? "").toLowerCase().replace(/[^\w]/g, "")]
  const ones = ordinalWords[secondOrdinal]
  if (tens && ones) {
    return [formatOrdinal(tens + ones), ...words.slice(2)].join(" ")
  }

  return sourceDistrict
}
