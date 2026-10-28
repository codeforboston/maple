/* The 194th session's conference committees still sitting, as on the
   homepage. Sample data here; the homepage loads them. */
export const openConferences = [
  [
    "ballot-question-campaign-finance",
    "Ballot Question Finance",
    "S2916",
    "H5558"
  ],
  ["higher-ed-infrastructure", "BRIGHT Act", "S2993", "H4769"],
  ["data-privacy", "Data Privacy", "S2619", "H5479"],
  ["energy-affordability", "Energy Affordability", "S3166", "H5175"],
  ["health-care-workplace-violence", "Health Worker Safety", "S3184", "H4767"],
  ["community-resilience", "Mass Ready Act", "S3064", "H5518"],
  ["pet-equity", "PETS Act", "S3028", "H5589"],
  [
    "student-learning-and-mental-health",
    "Phone-Free Schools",
    "S2581",
    "H5366"
  ],
  ["primary-care", "Primary Care", "S3141", "H5630"],
  ["public-records", "Public Records", "S3244", "H5469"],
  ["benefits-for-teachers", "Teacher Benefits", "S3109", "H4361"]
].map(([id, name, senateBillId, houseBillId]) => ({
  id,
  court: 194,
  name,
  title: name,
  senateBillId,
  houseBillId,
  status: "appointed" as const
}))
