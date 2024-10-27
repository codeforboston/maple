import {
  Array,
  InstanceOf,
  Number,
  Optional,
  Record,
  Static,
  String
} from "runtypes"
import { Id, Maybe, Nullable, NullStr, withDefaults } from "../common"
import { Timestamp } from "../firebase"

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

export type BillContent = Static<typeof BillContent>
export const BillContent = Record({
  Pinslip: Nullable(String),
  Title: String,
  PrimarySponsor: Nullable(Record({ Name: String })),
  DocumentText: Maybe(String),
  Cosponsors: Array(Record({ Name: Maybe(String) }))
})

/** Represents a missing timestamp value. This allows documents without values
 * to appear in results when sorting by that value. */
export const MISSING_TIMESTAMP = Timestamp.fromMillis(0)

export const TOPICS_BY_CATEGORY = {
  Commerce: [
    "Banking and financial institutions regulation",
    "Partnerships and Limited Liability Companies",
    "Non-Profit Law and Governance",
    "Consumer Protection",
    "Corporation Law and Goverance",
    "Marketing and advertising",
    "Retail and wholesale trades",
    "Securities"
  ],
  "Crime and Law Enforcement": [
    "Assault and harassment offenses",
    "Crimes against animals and natural resources",
    "Crimes against children",
    "Crimes against property",
    "Criminal investigation, prosecution, interrogation",
    "Criminal procedure and sentencing",
    "Firearms and explosives",
    "Fraud offenses and financial crimes",
    "Correctional Facilities",
    "Criminal Justice Reform"
  ],
  "Economics and Public Finance": [
    "Budget deficits and national debt",
    "Budget process",
    "Business expenses",
    "Currency",
    "Debt collection",
    "Economic development",
    "Economic performance and conditions",
    "Economic theory",
    "Employment taxes",
    "Finance and Financial Sector",
    "Financial crises and stabilization",
    "Financial literacy",
    "Financial services and investments",
    "Inflation and prices",
    "Interest, dividends, interest rates",
    "Labor-management relations",
    "Pension and retirement benefits"
  ],
  Education: [
    "Academic performance and assessments",
    "Adult education and literacy",
    "Educational facilities and institutions",
    "Higher education",
    "Special education",
    "Student aid and college costs",
    "Teaching, teachers, curricula",
    "Technology assessment",
    "Technology transfer and commercialization",
    "Vocational and technical education"
  ],
  "Emergency Management": [
    "Accidents",
    "Disaster relief and insurance",
    "Emergency communications systems",
    "Emergency medical services and trauma care",
    "Emergency planning and evacuation",
    "Hazards and emergency operations",
    "Search and rescue operations"
  ],
  Energy: [
    "Energy assitance for the poor and aged",
    "Energy efficiency and conservation",
    "Energy prices",
    "Energy research",
    "Energy revenues and royalties",
    "Energy storage, supplies, demand",
    "Renewable energy sources"
  ],
  Environment: [
    "Air quality",
    "Environmental assessment, monitoring, research",
    "Environmental education",
    "Environmental health",
    "Environmental regulatory procedures",
    "Hazardous wastes and toxic substances",
    "Pollution control and abatement",
    "Soil pollution",
    "Solid waste and recycling",
    "Water quality",
    "Wetlands"
  ],
  Families: [
    "Adoption and foster care",
    "Family planning and birth control",
    "Family relationships",
    "Family services",
    "Marriage and family status",
    "Parenting"
  ],
  "Government Operations and Politics": [
    "Census and government statistics",
    "Election administration",
    "Government ethics and transparency",
    "Government information and archives",
    "Government trust funds",
    "Legislative rules and procedure",
    "Lobbying and campaign finance",
    "Political advertising",
    "Political parties and affiliation",
    "Political representation",
    "Public contracts and procurement",
    "Public participation and lobbying",
    "Public-private cooperation"
  ],
  "Health and Food": [
    "Alcoholic beverages",
    "Allergies",
    "Alternative treatments",
    "Cancer",
    "Cardiovascular and respiratory health",
    "Dental care",
    "Digestive and metabolic diseases",
    "Drug safety, medical device, and laboratory regulation",
    "Drug therapy",
    "Drug, alcohol, tobacco use",
    "Endangered and threatened species",
    "Food industry and services",
    "Food supply, safety, and labeling",
    "Health care costs and insurance",
    "Health care coverage and access",
    "Health care quality",
    "Health facilities and institutions",
    "Health information and medical records",
    "Health personnel",
    "Health programs administration and funding",
    "Health promotion and preventive care",
    "Health technology, devices, supplies",
    "Hearing, speech, and vision care",
    "Hereditary and development disorders",
    "HIV/AIDS",
    "Medical education",
    "Medical ethics",
    "Medical research",
    "Medical tests and diagnostic methods",
    "Mental health",
    "Muscloskeletal and skin diseases",
    "Neurological disorders",
    "Nutrition and diet",
    "Prescription drugs",
    "Public health",
    "Radiation",
    "Sex and reproductive health"
  ],
  "Housing and Community Development": [
    "Community life and organization",
    "Commuting",
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
  Immigration: [
    "Border security and unlawful immigration",
    "Citizenship and naturalization",
    "Immigrant health and welfare",
    "Immigrant status and procedures",
    "Refugees, asylum, displaced persons",
    "Visa and passport requirements"
  ],
  "Labor and Employment": [
    "Employee benefits and pensions",
    "Employee hiring",
    "Employee leave",
    "Employee performance",
    "Employment and training programs",
    "Employment discrimination and employee rights",
    "Labor market",
    "Labor standards",
    "Migrant, seasonal, agricultural labor",
    "Self-employed",
    "Temporary and part-time employment",
    "Workers' compensation",
    "Worker safety and health",
    "Youth employment and child labor"
  ],
  Law: [
    "Administrative law and regulatory procedures",
    "Administrative remedies",
    "Civil actions and liability",
    "Civil disturbances",
    "Evidence and witnesses",
    "Judicial procedure and administration",
    "Judicial review and appeals",
    "Jurisdiction and venue",
    "Legal fees and court costs",
    "Property rights",
    "Rule of law and government transparency"
  ],
  "Public and Natural Resources": [
    "Forests, forestry, trees",
    "General public lands matters",
    "Marine and coastal resources, fisheries",
    "Marine pollution",
    "Monuments and memorials",
    "Water resources funding",
    "Wilderness"
  ],
  "Science, Technology, Communications": [
    "Advanced technology and technological innovations",
    "Atmospheric science and weather",
    "Computer security and identity theft",
    "Computers and information technology",
    "Earth sciences",
    "Ecology",
    "Environmental technology",
    "Genetics",
    "Internet, web applications, social media",
    "Photography and imaging",
    "Radio spectrum allocation",
    "Telecommunication rates and fees",
    "Telephone and wireless communication",
    "Television and film"
  ],
  "Social Sciences and History": [
    "Area studies and international education",
    "Archaeology and anthropology",
    "History and historiography",
    "Language arts",
    "Policy sciences",
    "World history",
    "Food assistance and relief"
  ],
  "Social Services": [
    "Child care and development",
    "Domestic violence and child abuse",
    "Home and outpatient care",
    "Social work, volunteer service, charitable organizations",
    "Unemployment",
    "Urban and suburban affairs and development",
    "Veterans' education, employment, rehabilitation",
    "Veterans' loans, housing, homeless programs",
    "Veterans' medical care"
  ],
  "Sports and Recreation": [
    "Athletes",
    "Games and hobbies",
    "Hunting and fishing",
    "Outdoor recreation",
    "Parks, recreation areas, trails",
    "Performing arts",
    "Professional sports",
    "Sports and recreation facilities"
  ],
  Taxation: [
    "Capital gains tax",
    "Corporate tax",
    "Estate tax",
    "Excise tax",
    "Gift tax",
    "Income tax",
    "Inheritance tax",
    "Payroll tax",
    "Property tax",
    "Sales tax",
    "Tariffs",
    "Transfer and inheritance taxes",
    "Tax-exempt organizations"
  ],
  "Transportation and Public Works": [
    "Aviation and airports",
    "Highways and roads",
    "Maritime affairs and fisheries",
    "Mass transit and transportation",
    "Public utilities and utility rates",
    "Railroads",
    "Transportation safety and security",
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
    topics: Array(String)
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
