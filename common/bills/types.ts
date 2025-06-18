import { Timestamp } from "../types"

import {
  Array,
  InstanceOf,
  Number,
  Optional,
  Record,
  Static,
  String
} from "runtypes"
import { Id, Maybe, NullStr } from "../types"
import { withDefaults } from "../common"

/** Represents a missing timestamp value. This allows documents without values
 * to appear in results when sorting by that value. */
export const MISSING_TIMESTAMP = Timestamp.fromMillis(0)

export type SortOptions =
  | "id"
  | "cosponsorCount"
  | "testimonyCount"
  | "latestTestimony"
  | "hearingDate"

export type FilterOptions =
  | { type: "bill"; id: string }
  | { type: "primarySponsor"; id: string }
  | { type: "committee"; id: string }
  | { type: "city"; name: string }

export type BillReference = Static<typeof BillReference>
export const BillReference = Record({
  BillNumber: NullStr,
  DocketNumber: NullStr,
  GeneralCourtNumber: Number
})

export type BillHistoryAction = Static<typeof BillHistoryAction>
export const BillHistoryAction = Record({
  Date: String,
  Branch: String,
  Action: String
})

export type BillHistory = Static<typeof BillHistory>
export const BillHistory = Array(BillHistoryAction)

export type CurrentCommittee = Static<typeof CurrentCommittee>
export const CommitteeMember = Record({
    id: String,
    name: String,
    email: NullStr
  }),
  CurrentCommittee = Record({
    id: String,
    name: String,
    houseChair: Maybe(CommitteeMember),
    senateChair: Maybe(CommitteeMember)
  })

export type BillTopic = Static<typeof BillTopic>
export const BillTopic = Record({
  category: String,
  topic: String
})

export const TOPICS_BY_CATEGORY = {
  Commerce: [
    "Banking and financial institutions regulation",
    "Consumer protection",
    "Corporation law and goverance",
    "Commercial insurance",
    "Marketing and advertising",
    "Non-profit law and governance",
    "Occupational licensing",
    "Partnerships and limited liability companies",
    "Retail and wholesale trades",
    "Securities"
  ],
  "Crime and Law Enforcement": [
    "Assault and harassment offenses",
    "Correctional facilities",
    "Crimes against animals and natural resources",
    "Crimes against children",
    "Criminal investigation, prosecution, interrogation",
    "Criminal justice information and records",
    "Criminal justice reform",
    "Criminal sentencing",
    "Firearms and explosives",
    "Fraud offenses and financial crimes",
    "Property crimes"
  ],
  "Economics and Public Finance": [
    "Budget process",
    "Debt collection",
    "Eminent domain",
    "Financial literacy",
    "Financial services and investments",
    "Government contractors",
    "Pension and retirement benefits"
  ],
  Education: [
    "Academic performance and assessments",
    "Adult education and literacy",
    "Charter and private schools",
    "Curriculum and standards",
    "Education technology",
    "Educational facilities and institutions",
    "Elementary and secondary education",
    "Higher education",
    "Special education",
    "Student aid and college costs",
    "Teachers and educators",
    "Vocational and technical education"
  ],
  "Emergency Management": [
    "Disaster relief and insurance",
    "Emergency communications systems",
    "Emergency medical services and trauma care",
    "Emergency planning and evacuation",
    "Hazards and emergency operations"
  ],
  Energy: [
    "Energy costs assistance",
    "Energy efficiency and conservation",
    "Energy infrastructure and storage",
    "Energy prices and subsidies",
    "Energy research",
    "Renewable energy sources"
  ],
  "Environmental Protection": [
    "Air quality",
    "Environmental assessment, monitoring, research",
    "Environmental education",
    "Environmental health",
    "Environmental regulatory procedures",
    "Hazardous wastes and toxic substances",
    "Pollution control and abatement",
    "Soil pollution",
    "Trash and recycling",
    "Water quality",
    "Wetlands",
    "Wildlife conservation"
  ],
  Families: [
    "Adoption and foster care",
    "Family planning and birth control",
    "Family relationships and status",
    "Family services",
    "Life insurance",
    "Parenting and parental rights"
  ],
  "Food, Drugs, and Alcohol": [
    "Alcoholic beverages and licenses",
    "Drug, alcohol, tobacco use",
    "Drug safety, medical device, and laboratory regulation",
    "Food industry and services",
    "Food service employment",
    "Food supply, safety, and labeling",
    "Nutrition and diet"
  ],
  "Government Operations and Elections": [
    "Census and government statistics",
    "Government information and archives",
    "Government studies and investigations",
    "Government trust funds",
    "Lobbying and campaign finance",
    'Municipality oversight and "home rule petitions"',
    "Political advertising",
    "Public-private partnerships",
    "Voting and elections"
  ],
  Healthcare: [
    "Alternative treatments",
    "Dental care",
    "Health care costs",
    "Health facilities and institutions",
    "Health information and medical records",
    "Health insurance and coverage",
    "Health technology, devices, supplies",
    "Healthcare workforce",
    "Medical research",
    "Mental health",
    "Prescription drugs",
    "Sex and reproductive health",
    "Substance use disorder and addiction",
    "Telehealth",
    "Veterinary services and pets"
  ],
  "Housing and Community Development": [
    "Community life and organization",
    "Cooperative and condominium housing",
    "Homelessness and emergency shelter",
    "Housing discrimination",
    "Housing finance and home ownership",
    "Housing for the elderly and disabled",
    "Housing industry and standards",
    "Housing supply and affordability",
    "Landlord and tenant",
    "Low- and moderate-income housing",
    "Residential rehabilitation and home repair"
  ],
  "Immigrants and Foreign Nationals": [
    "Immigrant health and welfare",
    "Refugees, asylum, displaced persons",
    "Right to shelter",
    "Translation and language services"
  ],
  "Labor and Employment": [
    "Employee benefits",
    "Employment discrimination",
    "Employee leave",
    "Employee pensions",
    "Employee performance",
    "Migrant, seasonal, agricultural labor",
    "Self-employment",
    "Temporary and part-time employment",
    "Workers' compensation",
    "Workforce development and employment training",
    "Worker safety and health",
    "Youth employment and child labor"
  ],
  "Law and Judiciary": [
    "Civil disturbances",
    "Evidence and witnesses",
    "Judicial and court records",
    "Judicial review and appeals",
    "Jurisdiction and venue",
    "Legal fees and court costs"
  ],
  "Public and Natural Resources": [
    "Agriculture and aquaculture",
    "Coastal zones and ocean",
    "Forests, forestry, trees",
    "Monuments and memorials",
    "Watershed and water resources",
    "Wildlife"
  ],
  "Social Services": [
    "Child care and development",
    "Domestic violence and child abuse",
    "Food assistance and relief",
    "Home and outpatient care",
    "Social work, volunteer service, charitable organizations",
    "Unemployment",
    "Urban and suburban affairs and development",
    "Veterans' education, employment, rehabilitation",
    "Veterans' loans, housing, homeless programs",
    "Veterans' medical care"
  ],
  "Sports and Recreation": [
    "Art and culture",
    "Gambling and lottery",
    "Hunting and fishing",
    "Outdoor recreation",
    "Professional sports, stadiums and arenas",
    "Public parks",
    "Sports and recreation facilities"
  ],
  Taxation: [
    "Capital gains tax",
    "Corporate tax",
    "Estate tax",
    "Excise tax",
    "Gift tax",
    "Income tax",
    "Payroll and emplyoment tax",
    "Property tax",
    "Sales tax",
    "Tax-exempt organizations",
    "Transfer and inheritance taxes"
  ],
  "Technology and Communications": [
    "Advanced technology and technological innovations",
    "Atmospheric science and weather",
    "Broadband and internet access",
    "Computers and information technology",
    "Cybersecurity and identity theft",
    "Data privacy",
    "Emerging technology (artificial intelligence, blockchain, etc.)",
    "Genetics",
    "Internet, web applications, social media",
    "Photography and imaging",
    "Telecommunication rates and fees",
    "Telephone and wireless communication"
  ],
  "Transportation and Public Works": [
    "Aviation and airports",
    "Highways and roads",
    "MBTA & public transportation",
    "Public utilities and utility rates",
    "Railroads",
    "Vehicle insurance and repairs",
    "Water storage",
    "Water use and supply"
  ]
}
export const CATEGORIES_BY_TOPIC = Object.entries(TOPICS_BY_CATEGORY).reduce(
  (acc, [category, topics]) => {
    topics.forEach(topic => {
      acc[topic] = category
    })

    return acc
  },
  {} as { [key: string]: string }
)

export const MemberReference = Record({
  Id: String,
  Name: String,
  /**  1 = Legislative Member, 2 = Committee, 3 = Public Request, 4 = Special
   * Request */
  Type: Number
})
export type MemberReference = Static<typeof MemberReference>

export type BillContent = Static<typeof BillContent>
export const BillContent = Record({
  Title: String,
  BillNumber: String,
  DocketNumber: String,
  GeneralCourtNumber: Number,
  PrimarySponsor: Optional(MemberReference),
  Cosponsors: Array(MemberReference),
  LegislationTypeName: String,
  Pinslip: String,
  DocumentText: Maybe(String)
})

export type Bill = Static<typeof Bill>
export const Bill = withDefaults(
  Record({
    id: Id,
    court: Number,
    content: BillContent,
    cosponsorCount: Number,
    testimonyCount: Number,
    endorseCount: Number,
    neutralCount: Number,
    opposeCount: Number,
    nextHearingAt: Optional(InstanceOf(Timestamp)),
    nextHearingId: Optional(Id),
    latestTestimonyAt: Optional(InstanceOf(Timestamp)),
    latestTestimonyId: Optional(Id),
    fetchedAt: InstanceOf(Timestamp),
    history: BillHistory,
    similar: Array(Id),
    currentCommittee: Optional(CurrentCommittee),
    city: Optional(String),
    topics: Optional(Array(BillTopic)),
    summary: Optional(String)
  }),
  {
    court: 0,
    cosponsorCount: 0,
    testimonyCount: 0,
    endorseCount: 0,
    neutralCount: 0,
    opposeCount: 0,
    latestTestimonyAt: MISSING_TIMESTAMP,
    nextHearingAt: MISSING_TIMESTAMP,
    fetchedAt: MISSING_TIMESTAMP,
    history: [],
    similar: [],
    topics: []
  }
)
