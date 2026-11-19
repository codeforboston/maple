/** Bill pages and bill search are on this site; links are relative. */
export const MAPLE_SITE = ""

export const billUrl = ({ court, id }: { court: number; id: string }) =>
  `${MAPLE_SITE}/bills/${court}/${id}`

/** MAPLE's bill search with the question prefilled (instantsearch routing: `?bills[query]=…`). */
export const billSearchUrl = (query?: string) =>
  query
    ? `${MAPLE_SITE}/bills?${encodeURIComponent(
        "bills[query]"
      )}=${encodeURIComponent(query)}`
    : `${MAPLE_SITE}/bills`

/** Bill links open in a new tab so the chat stays where it was. */
export const external = { target: "_blank", rel: "noopener noreferrer" }
