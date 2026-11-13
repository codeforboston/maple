import type { TopicKey } from "./TopicChips"

/**
 * The bill subtopics each homepage topic selects on the bills page, by
 * category. A subtopic goes in every topic it fits, so many appear more than
 * once: property tax is in housing, work and government, child care in
 * education and health.
 *
 * The names are the taxonomy's, letter for letter (TOPICS_BY_CATEGORY in
 * functions/src/bills/types.ts, misspellings included), since the bills page
 * matches them exactly. That file cannot be imported here, as it pulls in the
 * Firebase admin SDK, so the lists are written out; a subtopic added to or
 * renamed in the taxonomy needs adding here too.
 */
const SUBTOPICS: Record<TopicKey, Record<string, string[]>> = {
  // Education, Youth & Families
  education: {
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
    Families: [
      "Adoption and foster care",
      "Family planning and birth control",
      "Family relationships and status",
      "Family services",
      "Parenting and parental rights"
    ],
    "Labor and Employment": ["Employee leave"],
    "Social Services": [
      "Child care and development",
      "Domestic violence and child abuse"
    ]
  },
  // Healthcare & Human Services
  health: {
    Education: ["Special education"],
    "Emergency Management": ["Emergency medical services and trauma care"],
    Energy: ["Energy costs assistance"],
    "Environmental Protection": [
      "Air quality",
      "Environmental health",
      "Hazardous wastes and toxic substances",
      "Water quality"
    ],
    Families: [
      "Adoption and foster care",
      "Family planning and birth control",
      "Family services"
    ],
    "Food, Drugs, and Alcohol": [
      "Alcoholic beverages and licenses",
      "Drug, alcohol, tobacco use",
      "Drug safety, medical device, and laboratory regulation",
      "Food supply, safety, and labeling",
      "Nutrition and diet"
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
      "Homelessness and emergency shelter",
      "Housing for the elderly and disabled"
    ],
    "Immigrants and Foreign Nationals": [
      "Immigrant health and welfare",
      "Refugees, asylum, displaced persons"
    ],
    "Labor and Employment": ["Worker safety and health"],
    "Social Services": [
      "Child care and development",
      "Domestic violence and child abuse",
      "Food assistance and relief",
      "Home and outpatient care",
      "Social work, volunteer service, charitable organizations",
      "Unemployment",
      "Veterans' education, employment, rehabilitation",
      "Veterans' loans, housing, homeless programs",
      "Veterans' medical care"
    ],
    "Technology and Communications": ["Genetics"]
  },
  // Climate, Energy & Environment
  climate: {
    "Crime and Law Enforcement": [
      "Crimes against animals and natural resources"
    ],
    "Emergency Management": ["Disaster relief and insurance"],
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
    "Public and Natural Resources": [
      "Agriculture and aquaculture",
      "Coastal zones and ocean",
      "Forests, forestry, trees",
      "Monuments and memorials",
      "Watershed and water resources",
      "Wildlife"
    ],
    "Sports and Recreation": [
      "Hunting and fishing",
      "Outdoor recreation",
      "Public parks"
    ],
    "Technology and Communications": ["Atmospheric science and weather"],
    "Transportation and Public Works": [
      "MBTA & public transportation",
      "Public utilities and utility rates",
      "Water storage",
      "Water use and supply"
    ]
  },
  // Government, Rights & Safety
  democracy: {
    Commerce: ["Consumer protection"],
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
      "Eminent domain",
      "Government contractors"
    ],
    "Emergency Management": [
      "Disaster relief and insurance",
      "Emergency communications systems",
      "Emergency medical services and trauma care",
      "Emergency planning and evacuation",
      "Hazards and emergency operations"
    ],
    Families: ["Parenting and parental rights"],
    "Government Operations and Elections": [
      "Census and government statistics",
      "Government information and archives",
      "Government studies and investigations",
      "Government trust funds",
      "Lobbying and campaign finance",
      "Political advertising",
      "Public-private partnerships",
      "Voting and elections"
    ],
    "Housing and Community Development": ["Housing discrimination"],
    "Immigrants and Foreign Nationals": [
      "Immigrant health and welfare",
      "Refugees, asylum, displaced persons",
      "Right to shelter",
      "Translation and language services"
    ],
    "Labor and Employment": ["Employment discrimination"],
    "Law and Judiciary": [
      "Civil disturbances",
      "Evidence and witnesses",
      "Judicial and court records",
      "Judicial review and appeals",
      "Jurisdiction and venue",
      "Legal fees and court costs"
    ],
    "Social Services": ["Domestic violence and child abuse"],
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
      "Cybersecurity and identity theft",
      "Data privacy"
    ]
  },
  // Housing, Transit & Community
  housing: {
    "Economics and Public Finance": ["Eminent domain"],
    Healthcare: ["Veterinary services and pets"],
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
    "Public and Natural Resources": ["Monuments and memorials"],
    "Social Services": [
      "Social work, volunteer service, charitable organizations",
      "Urban and suburban affairs and development",
      "Veterans' loans, housing, homeless programs"
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
    Taxation: ["Property tax"],
    "Technology and Communications": ["Broadband and internet access"],
    "Transportation and Public Works": [
      "Aviation and airports",
      "Highways and roads",
      "MBTA & public transportation",
      "Railroads",
      "Vehicle insurance and repairs",
      "Water use and supply"
    ]
  },
  // Work, Money, Business & Tech
  work: {
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
    "Crime and Law Enforcement": ["Fraud offenses and financial crimes"],
    "Economics and Public Finance": [
      "Budget process",
      "Debt collection",
      "Financial literacy",
      "Financial services and investments",
      "Government contractors",
      "Pension and retirement benefits"
    ],
    Education: [
      "Student aid and college costs",
      "Teachers and educators",
      "Vocational and technical education"
    ],
    Energy: ["Energy costs assistance", "Energy prices and subsidies"],
    Families: ["Life insurance"],
    "Food, Drugs, and Alcohol": [
      "Alcoholic beverages and licenses",
      "Food industry and services",
      "Food service employment",
      "Food supply, safety, and labeling"
    ],
    "Government Operations and Elections": [
      "Government trust funds",
      "Public-private partnerships"
    ],
    Healthcare: [
      "Health care costs",
      "Health insurance and coverage",
      "Healthcare workforce"
    ],
    "Housing and Community Development": ["Housing finance and home ownership"],
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
    "Public and Natural Resources": ["Agriculture and aquaculture"],
    "Social Services": [
      "Unemployment",
      "Veterans' education, employment, rehabilitation"
    ],
    "Sports and Recreation": ["Gambling and lottery"],
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
      "Public utilities and utility rates",
      "Vehicle insurance and repairs"
    ]
  }
}

/** Each topic's subtopics as the search index spells them, "Category >
 * Subtopic" (functions/src/bills/search.ts). */
const indexValues = (topic: TopicKey) =>
  Object.entries(SUBTOPICS[topic]).flatMap(([category, subtopics]) =>
    subtopics.map(subtopic => `${category} > ${subtopic}`)
  )

/**
 * The bills page with a topic's subtopics selected in its Topics filter, and
 * the current session, as the page opens by default. The bills page keeps its
 * filters in the address (components/search/bills/BillSearch.tsx), under its
 * index, "bills" (billsDefaultIndex in components/search/bills/useBillSort.tsx,
 * not imported here so the homepage does not load the search components).
 * Lists use "[]" rather than numbered entries, which the page would read as an
 * object, not a list, past 20 (components/search/routingHelpers.ts).
 */
export const topicBillsHref = (topic: TopicKey, court: number) => {
  const params = new URLSearchParams()
  params.append("bills[refinementList][court][]", String(court))
  for (const value of indexValues(topic))
    params.append("bills[multiselectHierarchicalMenu][topics.lvl1][]", value)
  return `/bills?${params.toString()}`
}
