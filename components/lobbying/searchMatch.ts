/**
 * True if every whitespace-separated word in `query` appears somewhere in
 * `target` (case-insensitive), in any order and with any gap between them.
 *
 * A plain target.includes(query) rejects "john griffin" against the name
 * "John A Griffin" — "griffin" doesn't immediately follow "john " in the
 * string. Splitting into words and requiring each to match independently is
 * what a name-search box needs to behave: word order and middle names/
 * initials shouldn't matter.
 */
export function matchesSearch(target: string, query: string): boolean {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return true
  const targetLower = target.toLowerCase()
  return words.every(word => targetLower.includes(word))
}
