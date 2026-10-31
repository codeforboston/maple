import { axios } from "../../malegislature"
import chapterSectionNames from "./chapterSectionNames.json"

export type ChapterSection = [chapter: string, section: string]

/**
 * Pulls the Massachusetts General Laws (MGL) chapter and section references
 * out of a bill using regular expressions. A section is paired with the
 * chapter named alongside it ("section 5 of chapter 12") or, failing that,
 * the most recent chapter mentioned.
 */
export const extractSections = (billText: string): ChapterSection[] => {
  // Matches "section# of chapter#", "section# of said chapter#", "section#"
  // or "chapter#". Every unmatched group is an empty string, as in Python's
  // `re.findall`, which the pairing logic below relies on.
  const matches = [
    ...billText.matchAll(
      /(section)(\s+\d+[a-zA-Z]+|\s+\d+)\s+(of|of\ssaid)\s(chapter)(\s+\d+[a-zA-Z]+|\s\d+)|(section|chapter)(\s+\d+[a-zA-Z]+|\s\d+)/gi
    )
  ].map(m => m.slice(1, 8).map(group => group ?? ""))

  const pairs: ChapterSection[] = []
  const addPair = (chapter: string, section: string) => {
    if (!pairs.some(([c, s]) => c === chapter && s === section)) {
      pairs.push([chapter, section])
    }
  }
  let currentChapter = ""
  let section = ""

  for (const x of matches) {
    const items = x.map(item => item.toLowerCase())
    if (items.includes("section") && items.includes("chapter")) {
      x.forEach((j, i) => {
        if (j.toLowerCase() === "section") {
          section = x[i + 1].trim()
        }
        if (j.toLowerCase() === "chapter") {
          currentChapter = x[i + 1].trim()
          addPair(currentChapter, section)
        }
      })
    } else {
      x.forEach((j, i) => {
        // An all-caps SECTION is a section of the bill itself, not of the MGL.
        if (j === "SECTION" || j === "") return
        if (j.toLowerCase() === "chapter") {
          currentChapter = x[i + 1].trim()
        }
        if (j.toLowerCase() === "section") {
          if (x[i + 1] === "") return
          section = x[i + 1].trim()
          addPair(currentChapter, section)
        }
      })
    }
  }
  return pairs
}

const REQUEST_BATCH_SIZE = 5

/**
 * The text of one MGL section from the malegislature.gov API, or undefined if
 * the request fails or the section has no text.
 */
export const querySectionText = async ([
  chapter,
  section
]: ChapterSection): Promise<string | undefined> => {
  try {
    const response = await axios.get(
      `/Chapters/${encodeURIComponent(chapter)}/Sections/${encodeURIComponent(section)}`
    )
    const text: unknown = response.data?.Text
    return typeof text === "string" && text !== "" && text !== "nan"
      ? text
      : undefined
  } catch {
    return undefined
  }
}

/**
 * Fetches the text for every chapter/section pair, in order, a few requests at
 * a time. Pairs that return nothing are reported separately.
 */
export const queryAllSectionText = async (
  chapterSections: ChapterSection[]
): Promise<{ formattedData: string[]; emptyResponses: ChapterSection[] }> => {
  const formattedData: string[] = []
  const emptyResponses: ChapterSection[] = []

  for (let i = 0; i < chapterSections.length; i += REQUEST_BATCH_SIZE) {
    const batch = chapterSections.slice(i, i + REQUEST_BATCH_SIZE)
    const texts = await Promise.all(batch.map(querySectionText))
    texts.forEach((text, j) => {
      if (text === undefined) {
        emptyResponses.push(batch[j])
      } else {
        formattedData.push(text)
      }
    })
  }
  return { formattedData, emptyResponses }
}

const NAMES = chapterSectionNames as unknown as Record<
  string,
  [chapter: string, section: string]
>

/**
 * Chapter and section names for the given references, as
 * "CHAPTER NAME: Section name, ...". Names come from a checked-in copy of the
 * MGL table of contents (`chapterSectionNames.json`, exported from the
 * original `llm/chapter_section_names.pq`). Entries are keyed by chapter name,
 * so when several sections of one chapter are referenced only the last one is
 * listed — the behavior of the original implementation.
 * TODO: replace with the MGL data once it lives in the database.
 */
export const getChapSecNames = (chapterSections: ChapterSection[]): string => {
  const names = new Map<string, string>()
  for (const [chapter, section] of chapterSections) {
    const entry = NAMES[`${chapter}|${section}`]
    if (entry) names.set(entry[0], entry[1])
  }
  return [...names].map(([chapter, name]) => `${chapter}: ${name}`).join(", ")
}

/** The MGL text a bill references, and the names of those chapters/sections. */
export const extractBillContext = async (
  billText: string
): Promise<{ combinedMgl: string; mglNames: string }> => {
  const sections = extractSections(billText)
  const { formattedData } = await queryAllSectionText(sections)
  return {
    combinedMgl: formattedData.length !== 0 ? formattedData.join(" ") : "None",
    mglNames: getChapSecNames(sections)
  }
}
