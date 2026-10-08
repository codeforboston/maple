/** The hearing document as it is indexed in Typesense. Lives here rather than
 * in ./search.ts so the search UI can import it without pulling firebase-admin
 * into the client bundle — the same split bills and testimony use.
 */
export type HearingSearchRecord = {
  id: string
  eventId: number
  title: string
  description?: string
  startsAt: number
  month: string
  year: number
  committeeCode?: string
  committeeName?: string
  locationName?: string
  locationCity?: string
  chairNames: string[]
  agendaTopics: string[]
  billNumbers: string[]
  billSlugs: string[]
  court: number
  hasVideo: boolean
}
