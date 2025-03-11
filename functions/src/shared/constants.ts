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
  }
}

export const supportedGeneralCourts = Object.keys(generalCourts)
  .map(n => Number.parseInt(n))
  .sort()
  .reverse()

export const currentGeneralCourt = supportedGeneralCourts[0]

export const isCurrentCourt = (courtNumber: number) =>
  courtNumber === currentGeneralCourt
