export type GeneralCourt = {
  Name: string
  Number: number
  FirstYear: number
  SecondYear: number
}

export const generalCourts: Record<number, GeneralCourt | undefined> = {
  194: {
    Name: "194th (Current)",
    Number: 194,
    FirstYear: 2025,
    SecondYear: 2026
  },
  193: {
    Name: "193rd (2023 - 2024)",
    Number: 193,
    FirstYear: 2023,
    SecondYear: 2024
  },
  192: {
    Name: "192nd (2021 - 2022)",
    Number: 192,
    FirstYear: 2021,
    SecondYear: 2022
  },
  191: {
    Name: "191st (2019 - 2020)",
    Number: 191,
    FirstYear: 2019,
    SecondYear: 2020
  },
  190: {
    Name: "190th (2017 - 2018)",
    Number: 190,
    FirstYear: 2017,
    SecondYear: 2018
  },
  189: {
    Name: "189th (2015 - 2016)",
    Number: 189,
    FirstYear: 2015,
    SecondYear: 2016
  }
}

export const supportedGeneralCourts = Object.keys(generalCourts)
  .map(n => Number.parseInt(n))
  .sort()
  .reverse()

export const currentGeneralCourt = supportedGeneralCourts[0]

export const isCurrentCourt = (courtNumber: number) =>
  courtNumber === currentGeneralCourt

// Only applicable for court 193/194, but by the time we have another general court,
// the full ballot initiative feature should be available and we can remove this check
export const currentBallotInitiativeCommittee = "SJ42"
