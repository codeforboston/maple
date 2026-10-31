import { getEncoding } from "js-tiktoken"

/**
 * Ports of the two LangChain splitters the Python implementation used, kept
 * algorithmically identical so chunk boundaries (and therefore prompts) match.
 */

const joinDocs = (docs: string[], separator: string): string | null => {
  const text = docs.join(separator).trim()
  return text === "" ? null : text
}

/**
 * `CharacterTextSplitter(chunk_size, chunk_overlap)` with LangChain's default
 * "\n\n" separator. A single paragraph longer than `chunkSize` is not split
 * further, exactly as in LangChain.
 */
export const splitTextByCharacters = (
  text: string,
  chunkSize: number,
  chunkOverlap: number,
  separator = "\n\n"
): string[] => {
  const splits = text.split(separator).filter(s => s !== "")
  const separatorLength = separator.length
  const docs: string[] = []
  let currentDoc: string[] = []
  let total = 0

  for (const d of splits) {
    const length = d.length
    if (
      total + length + (currentDoc.length > 0 ? separatorLength : 0) >
      chunkSize
    ) {
      if (currentDoc.length > 0) {
        const doc = joinDocs(currentDoc, separator)
        if (doc !== null) docs.push(doc)
        while (
          total > chunkOverlap ||
          (total + length + (currentDoc.length > 0 ? separatorLength : 0) >
            chunkSize &&
            total > 0)
        ) {
          total -=
            currentDoc[0].length + (currentDoc.length > 1 ? separatorLength : 0)
          currentDoc = currentDoc.slice(1)
        }
      }
    }
    currentDoc.push(d)
    total += length + (currentDoc.length > 1 ? separatorLength : 0)
  }

  const doc = joinDocs(currentDoc, separator)
  if (doc !== null) docs.push(doc)
  return docs
}

/**
 * `TokenTextSplitter.from_tiktoken_encoder(chunk_size, chunk_overlap)`, which
 * windows over the text's `gpt2` tokens (LangChain's default encoding).
 */
export const splitTextByTokens = (
  text: string,
  chunkSize: number,
  chunkOverlap: number
): string[] => {
  const encoding = getEncoding("gpt2")
  const ids = encoding.encode(text, [], [])
  const splits: string[] = []
  let start = 0
  let end = Math.min(start + chunkSize, ids.length)

  while (start < ids.length) {
    splits.push(encoding.decode(ids.slice(start, end)))
    if (end === ids.length) break
    start += chunkSize - chunkOverlap
    end = Math.min(start + chunkSize, ids.length)
  }
  return splits
}
