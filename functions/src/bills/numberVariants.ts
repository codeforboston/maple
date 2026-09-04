/** Bump when the variant logic below changes what it emits.
 *
 * All three search configs set `convertVersion: billNumberVariantsVersion`, so
 * this one line reindexes every collection that indexes bill numbers. That
 * matters because `searchCollectionName` hashes `convert.toString()` and
 * nothing it calls — a helper shared by three converters is invisible to all
 * three hashes. Editing the function without bumping this would not give three
 * stale indexes so much as three DIVERGENT ones, with bills matching "H 100"
 * while testimony quietly stopped.
 */
export const billNumberVariantsVersion = 1

/** Space-separated forms of a bill number, to be indexed alongside it.
 *
 * "H100" is a single token, so the queries people actually type — "H 100",
 * "H. 100", "H-100" — tokenize to ["h", "100"] and can never match it.
 * Indexing "H 100" as its own array element makes them match, and lets
 * prioritize_exact_match fire on the whole element.
 *
 * Returns an empty array when the number has no distinct spaced form, so
 * nothing redundant is indexed.
 */
export const billNumberVariants = (number: string): string[] => {
  const spaced = number.replace(/^[A-Za-z]+(?=\d)/, "$& ")
  return spaced === number ? [] : [spaced]
}
