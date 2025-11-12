import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter"

type FacetMap = Record<string, Record<string, number>>

type MockHit = {
  objectID: string
  id: string
  eventId: number
  title: string
  description?: string
  startsAt: number
  month: string
  year: number
  committeeName?: string
  chairNames: string[]
  agendaTopics: string[]
  billNumbers: string[]
  billSlugs: string[]
  court: number
  locationName?: string
  locationCity?: string
  hasVideo: boolean
  _highlightResult: Record<
    string,
    { value: string; matchLevel: string; matchedWords: string[] }
  >
}

type MockInstantSearchConfig = {
  hits: MockHit[]
  facets: FacetMap
}

type SearchResult = {
  hits: MockHit[]
  hitsPerPage: number
  nbHits: number
  page: number
  nbPages: number
  processingTimeMS: number
  query: string
  params: string
  index: string
  facets: FacetMap
  facets_stats: Record<string, never>
  disjunctiveFacets: FacetMap
  exhaustiveFacetsCount: boolean
  exhaustiveNbHits: boolean
  renderingContent: Record<string, never>
}

let isPatched = false

const DEFAULT_INDEX = "hearings/sort/startsAt:asc"

const createSearchResult = ({
  hits,
  facets
}: MockInstantSearchConfig): SearchResult => {
  return {
    hits,
    hitsPerPage: 20,
    nbHits: hits.length,
    page: 0,
    nbPages: 1,
    processingTimeMS: 1,
    query: "mock-query",
    params: "",
    index: DEFAULT_INDEX,
    facets,
    facets_stats: {},
    disjunctiveFacets: facets,
    exhaustiveFacetsCount: true,
    exhaustiveNbHits: true,
    renderingContent: {}
  }
}

const facetEntries = (facets: FacetMap, facetName?: string) => {
  if (!facetName) return []
  const entries = Object.entries(facets[facetName] ?? {})
  return entries.map(([value, count]) => ({
    value,
    count,
    highlighted: value
  }))
}

const resolveFacetName = (request: any): string | undefined => {
  return (
    request?.params?.facetName ??
    request?.params?.facet ??
    request?.params?.facetName ??
    request?.facetName
  )
}

export const setupMockInstantSearchAdapter = ({
  hits,
  facets
}: MockInstantSearchConfig) => {
  if (isPatched) return

  const searchResult = createSearchResult({ hits, facets })

  const adapterProto = TypesenseInstantSearchAdapter.prototype as any

  adapterProto.searchTypesenseAndAdapt = async function (
    instantsearchRequests: any[]
  ) {
    return {
      results: instantsearchRequests.map(() => ({ ...searchResult }))
    }
  }

  adapterProto.searchTypesenseForFacetValuesAndAdapt = async function (
    instantsearchRequests: any[]
  ) {
    return instantsearchRequests.map(request => ({
      facetHits: facetEntries(searchResult.facets, resolveFacetName(request)),
      exhaustiveFacetsCount: true,
      processingTimeMS: 1
    }))
  }

  isPatched = true
}

export const getDefaultHearingHits = (): MockHit[] => {
  const makeHighlight = (value: string) => ({
    value,
    matchLevel: "none",
    matchedWords: []
  })

  return [
    {
      objectID: "hearing-1",
      id: "hearing-1",
      eventId: 101,
      title: "Budget Hearing on Education",
      description: "Discussion on statewide education funding priorities.",
      startsAt: new Date("2024-04-05T14:00:00-04:00").getTime(),
      month: "Apr",
      year: 2024,
      committeeName: "Joint Committee on Education",
      chairNames: ["Rep. Alice Johnson", "Sen. Mark Rivera"],
      agendaTopics: ["Education", "Budget"],
      billNumbers: ["H1234", "S5678"],
      billSlugs: ["194/H1234", "194/S5678"],
      locationName: "State House - Gardner Auditorium",
      locationCity: "Boston",
      hasVideo: true,
      court: 194,
      _highlightResult: {
        title: makeHighlight("Budget Hearing on Education"),
        description: makeHighlight(
          "Discussion on statewide education funding priorities."
        ),
        committeeName: makeHighlight("Joint Committee on Education"),
        locationName: makeHighlight("State House - Gardner Auditorium")
      }
    },
    {
      objectID: "hearing-2",
      id: "hearing-2",
      eventId: 102,
      title: "Climate Resilience Oversight",
      description: "Examining the state's infrastructure preparedness.",
      startsAt: new Date("2024-04-12T10:00:00-04:00").getTime(),
      month: "Apr",
      year: 2024,
      committeeName:
        "Joint Committee on Environment, Natural Resources and Agriculture",
      chairNames: ["Sen. Lila Shah"],
      agendaTopics: ["Climate", "Infrastructure"],
      billNumbers: ["H4321"],
      billSlugs: ["194/H4321"],
      locationName: "State House - Room B-2",
      locationCity: "Boston",
      hasVideo: false,
      court: 194,
      _highlightResult: {
        title: makeHighlight("Climate Resilience Oversight"),
        description: makeHighlight(
          "Examining the state's infrastructure preparedness."
        ),
        committeeName: makeHighlight(
          "Joint Committee on Environment, Natural Resources and Agriculture"
        ),
        locationName: makeHighlight("State House - Room B-2")
      }
    },
    {
      objectID: "hearing-3",
      id: "hearing-3",
      eventId: 103,
      title: "Healthcare Access Listening Session",
      description: "Public testimony on barriers to primary care.",
      startsAt: new Date("2024-05-03T09:30:00-04:00").getTime(),
      month: "May",
      year: 2024,
      committeeName: "Joint Committee on Health Care Financing",
      chairNames: ["Rep. Jordan Lee"],
      agendaTopics: ["Health", "Primary Care"],
      billNumbers: ["H2450", "H2451"],
      billSlugs: ["193/H2450", "193/H2451"],
      locationName: "Springfield City Hall",
      locationCity: "Springfield",
      hasVideo: true,
      court: 193,
      _highlightResult: {
        title: makeHighlight("Healthcare Access Listening Session"),
        description: makeHighlight(
          "Public testimony on barriers to primary care."
        ),
        committeeName: makeHighlight(
          "Joint Committee on Health Care Financing"
        ),
        locationName: makeHighlight("Springfield City Hall")
      }
    }
  ]
}

export const getDefaultHearingFacets = (): FacetMap => ({
  court: {
    "194": 2,
    "193": 1
  },
  month: {
    Apr: 2,
    May: 1
  },
  year: {
    "2024": 3
  },
  committeeName: {
    "Joint Committee on Education": 1,
    "Joint Committee on Environment, Natural Resources and Agriculture": 1,
    "Joint Committee on Health Care Financing": 1
  },
  chairNames: {
    "Rep. Alice Johnson": 1,
    "Sen. Mark Rivera": 1,
    "Sen. Lila Shah": 1,
    "Rep. Jordan Lee": 1
  }
})
